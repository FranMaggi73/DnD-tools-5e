// backend/cmd/api/main.go (MODIFICACIONES)
package main

import (
	"context"
	"log"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"

	"github.com/FranMaggi73/dm-events-backend/internal/cache"
	"github.com/FranMaggi73/dm-events-backend/internal/handlers"
	"github.com/FranMaggi73/dm-events-backend/internal/middleware"
	"github.com/FranMaggi73/dm-events-backend/internal/ratelimit"
)

func main() {
	ctx := context.Background()

	// ===== INICIALIZAR FIREBASE =====
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Error inicializando Firebase: %v", err)
	}

	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Error obteniendo cliente Firestore: %v", err)
	}
	defer firestoreClient.Close()

	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("Error obteniendo cliente Auth: %v", err)
	}

	// ===== INICIALIZAR CACHÉ EN MEMORIA =====
	// TTL por defecto: 30 segundos (sobreescrito por tipo de dato)
	cacheInstance := cache.NewCache(30 * time.Second)
	log.Println("✅ Caché en memoria inicializado")

	// ===== INICIALIZAR INVALIDACIÓN DISTRIBUIDA (SI HAY REDIS) =====
	var invalidator *cache.CacheInvalidator
	redisURL := os.Getenv("REDIS_URL")

	if redisURL != "" {
		inv, err := cache.NewCacheInvalidator(redisURL, cacheInstance)
		if err != nil {
			log.Printf("⚠️  No se pudo inicializar Redis Pub/Sub: %v", err)
			log.Println("⚠️  Continuando sin invalidación distribuida")
		} else {
			invalidator = inv
			defer invalidator.Close()
			log.Println("✅ Redis Pub/Sub inicializado para invalidación distribuida")
		}
	}

	// ===== RATE LIMITER CON REDIS =====
	var rateLimiter middleware.RateLimiter

	if redisURL != "" {
		redisLimiter, err := ratelimit.NewRedisLimiter(redisURL, 20, 1*time.Minute)
		if err != nil {
			log.Printf("⚠️  No se pudo conectar a Redis para rate limiting: %v", err)
			log.Println("⚠️  Usando rate limiter en memoria")
			rateLimiter = middleware.NewInMemoryLimiter(20, 1*time.Minute)
		} else {
			rateLimiter = redisLimiter
			defer redisLimiter.Close()
			log.Println("✅ Rate limiter con Redis inicializado")
		}
	} else {
		log.Println("⚠️  REDIS_URL no configurado, usando rate limiter en memoria")
		rateLimiter = middleware.NewInMemoryLimiter(20, 1*time.Minute)
	}

	// ===== ROUTER GIN =====
	r := gin.Default()

	// ===== CORS =====
	config := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	env := os.Getenv("ENV")
	if env == "production" {
		config.AllowOrigins = []string{
			"https://dnd5etools-73.web.app",
			"https://dnd5etools-73.firebaseapp.com",
		}
		log.Println("🌐 CORS configurado para PRODUCCIÓN")
	} else {
		config.AllowOrigins = []string{"http://localhost:5173"}
		log.Println("🛠️  CORS configurado para DESARROLLO")
	}

	r.Use(cors.New(config))

	// ===== HANDLERS CON INVALIDADOR =====
	h := handlers.NewHandlerWithInvalidator(firestoreClient, authClient, cacheInstance, invalidator)
	pm := middleware.NewPermissionsMiddleware(firestoreClient, cacheInstance)

	// ===== RUTAS PÚBLICAS =====
	public := r.Group("/api")
	{
		public.GET("/health", func(c *gin.Context) {
			healthCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
			defer cancel()

			firestoreStatus := "ok"
			_, err := firestoreClient.Collection("users").Limit(1).Documents(healthCtx).Next()
			if err != nil && err != iterator.Done {
				firestoreStatus = "degraded"
			}

			stats := cacheInstance.Stats()

			healthData := gin.H{
				"status":    "ok",
				"env":       env,
				"timestamp": time.Now().Format(time.RFC3339),
				"services": gin.H{
					"firestore": firestoreStatus,
					"cache":     "ok",
					"redis":     redisURL != "",
				},
				"cache_stats": stats,
			}

			// Agregar info de Redis Pub/Sub si está disponible
			if invalidator != nil {
				if err := invalidator.Health(healthCtx); err != nil {
					healthData["services"].(gin.H)["redis_pubsub"] = "degraded"
				} else {
					healthData["services"].(gin.H)["redis_pubsub"] = "ok"
				}
			}

			c.JSON(200, healthData)
		})
	}

	// ===== RUTAS PROTEGIDAS =====
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(authClient))
	{
		// Usuarios
		protected.GET("/users/me", h.GetCurrentUser)

		// Campañas
		protected.POST("/campaigns", middleware.RateLimitMiddleware(rateLimiter), h.CreateEvent)
		protected.GET("/campaigns", h.GetUserEvents)
		protected.GET("/campaigns/:id/full", pm.RequireCampaignMember(), h.GetCampaignFullData)
		protected.GET("/campaigns/:id", h.GetEvent)
		protected.DELETE("/campaigns/:id", pm.RequireCampaignDM(), h.DeleteEvent)

		// Miembros
		protected.POST("/campaigns/:id/invite", pm.RequireCampaignDM(), middleware.RateLimitMiddleware(rateLimiter), h.InvitePlayer)
		protected.DELETE("/campaigns/:id/players/:userId", pm.RequireCampaignDM(), h.RemovePlayer)
		protected.GET("/campaigns/:id/members", h.GetEventMembers)

		// Invitaciones
		protected.GET("/invitations", h.GetMyInvitations)
		protected.POST("/invitations/:id/respond", h.RespondToInvitation)

		// Personajes
		protected.POST("/campaigns/:id/characters", pm.RequireCampaignMember(), middleware.RateLimitMiddleware(rateLimiter), h.CreateCharacter)
		protected.GET("/campaigns/:id/characters", h.GetCampaignCharacters)
		protected.PUT("/characters/:charId", pm.RequireCharacterOwnerOrDM(), h.UpdateCharacter)
		protected.DELETE("/characters/:charId", pm.RequireCharacterOwnerOrDM(), h.DeleteCharacter)

		// Encuentros
		protected.POST("/campaigns/:id/encounters", pm.RequireCampaignDM(), middleware.RateLimitMiddleware(rateLimiter), h.CreateEncounter)
		protected.GET("/campaigns/:id/encounters/active", h.GetActiveEncounter)
		protected.GET("/campaigns/:id/combat/full", pm.RequireCampaignMember(), h.GetCombatFullData)
		protected.DELETE("/encounters/:encounterId", pm.RequireEncounterDM(), h.EndEncounter)
		protected.POST("/encounters/:encounterId/reset", pm.RequireEncounterDM(), h.ResetEncounter)

		// Combatientes
		protected.POST("/encounters/:encounterId/combatants", pm.RequireEncounterDM(), middleware.RateLimitMiddleware(rateLimiter), h.AddCombatant)
		protected.GET("/encounters/:encounterId/combatants", h.GetCombatants)
		protected.PUT("/combatants/:combatantId", h.UpdateCombatant)
		protected.DELETE("/combatants/:combatantId", h.RemoveCombatant)

		// Turnos
		protected.POST("/encounters/:encounterId/next-turn", pm.RequireEncounterDM(), h.NextTurn)

		// Notas
		protected.POST("/campaigns/:id/notes", pm.RequireCampaignMember(), middleware.RateLimitMiddleware(rateLimiter), h.CreateNote)
		protected.GET("/campaigns/:id/notes", pm.RequireCampaignMember(), h.GetCampaignNotes)
		protected.GET("/notes/:noteId", h.GetNote)
		protected.PUT("/notes/:noteId", h.UpdateNote)
		protected.DELETE("/notes/:noteId", h.DeleteNote)

		// Caché management
		protected.POST("/cache/clear", h.ClearCache)
		protected.GET("/cache/stats", h.GetCacheStats)
	}

	// ===== CRON JOB =====
	go func() {
		time.Sleep(1 * time.Hour)
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		cleanupOldData(firestoreClient, ctx)

		for range ticker.C {
			cleanupOldData(firestoreClient, ctx)
		}
	}()

	log.Printf("🕐 Limpieza automática programada (cada 24 horas)")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Servidor corriendo en puerto %s", port)
	log.Printf("✨ Optimizaciones activas:")
	log.Printf("   - Caché en memoria con timestamps y validación")
	log.Printf("   - TTL dinámico por tipo de dato:")
	log.Printf("     * Campañas: 10 seg")
	log.Printf("     * Personajes/Miembros: 30 seg")
	log.Printf("     * Encuentros: 5 seg (críticos)")

	if invalidator != nil {
		log.Printf("   - Invalidación distribuida con Redis Pub/Sub ✅")
	} else {
		log.Printf("   - Invalidación distribuida: NO (single instance)")
	}

	log.Printf("   - Rate limiting (%s): 20 req/min por usuario", func() string {
		if redisURL != "" {
			return "Redis"
		}
		return "in-memory"
	}())

	r.Run(":" + port)
}

// ===================================================================
// FUNCIÓN DE LIMPIEZA AUTOMÁTICA
// ===================================================================

func cleanupOldData(db *firestore.Client, ctx context.Context) {
	log.Println("🧹 Iniciando limpieza automática...")

	totalDeleted := 0

	// ===== 1. ELIMINAR INVITACIONES RESPONDIDAS HACE MÁS DE 30 DÍAS =====
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	invitationsIter := db.Collection("invitations").
		Where("respondedAt", "<", thirtyDaysAgo).
		Documents(ctx)

	deletedInvitations := 0
	batch := db.Batch()

	for {
		doc, err := invitationsIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			continue
		}

		var inv map[string]interface{}
		if err := doc.DataTo(&inv); err != nil {
			continue
		}

		// Solo eliminar si tiene status (accepted/rejected)
		if status, ok := inv["status"].(string); ok {
			if status == "accepted" || status == "rejected" {
				batch.Delete(doc.Ref)
				deletedInvitations++

				if deletedInvitations >= 400 {
					if _, err := batch.Commit(ctx); err != nil {
						log.Printf("❌ Error limpiando invitaciones: %v", err)
					}
					totalDeleted += deletedInvitations
					batch = db.Batch()
					deletedInvitations = 0
				}
			}
		}
	}

	if deletedInvitations > 0 {
		if _, err := batch.Commit(ctx); err != nil {
			log.Printf("❌ Error en commit final de invitaciones: %v", err)
		} else {
			totalDeleted += deletedInvitations
			log.Printf("✅ %d invitaciones antiguas eliminadas", deletedInvitations)
		}
	}

	// ===== 2. LIMPIAR ENCUENTROS INACTIVOS SIN COMBATIENTES =====
	encountersIter := db.Collection("encounters").
		Where("isActive", "==", false).
		Documents(ctx)

	deletedEncounters := 0
	encounterBatch := db.Batch()

	for {
		doc, err := encountersIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			continue
		}

		// Verificar que no tenga combatientes
		combatantsIter := db.Collection("combatants").
			Where("encounterId", "==", doc.Ref.ID).
			Limit(1).
			Documents(ctx)

		_, err = combatantsIter.Next()
		if err != iterator.Done {
			continue // Tiene combatientes, no eliminar
		}

		encounterBatch.Delete(doc.Ref)
		deletedEncounters++

		if deletedEncounters >= 400 {
			if _, err := encounterBatch.Commit(ctx); err != nil {
				log.Printf("❌ Error limpiando encuentros: %v", err)
			}
			totalDeleted += deletedEncounters
			encounterBatch = db.Batch()
			deletedEncounters = 0
		}
	}

	if deletedEncounters > 0 {
		if _, err := encounterBatch.Commit(ctx); err != nil {
			log.Printf("❌ Error en commit final de encuentros: %v", err)
		} else {
			totalDeleted += deletedEncounters
			log.Printf("✅ %d encuentros huérfanos eliminados", deletedEncounters)
		}
	}

	// ===== RESUMEN =====
	if totalDeleted > 0 {
		log.Printf("✅ Limpieza completada: %d documentos eliminados en total", totalDeleted)
	} else {
		log.Println("✅ Limpieza completada: No había documentos para eliminar")
	}
}
