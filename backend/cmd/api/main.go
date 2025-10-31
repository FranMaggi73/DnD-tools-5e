package main

import (
	"context"
	"log"
	"os"
	"sync"
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
)

// ===== RATE LIMITER =====
type RateLimiter struct {
	requests map[string][]time.Time
	mu       sync.Mutex
	limit    int
	window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}

	// Cleanup cada minuto
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			rl.cleanup()
		}
	}()

	return rl
}

func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	// Filtrar requests antiguos
	if times, exists := rl.requests[key]; exists {
		valid := []time.Time{}
		for _, t := range times {
			if t.After(windowStart) {
				valid = append(valid, t)
			}
		}
		rl.requests[key] = valid
	}

	// Verificar límite
	if len(rl.requests[key]) >= rl.limit {
		return false
	}

	// Agregar request
	rl.requests[key] = append(rl.requests[key], now)
	return true
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	for key, times := range rl.requests {
		valid := []time.Time{}
		for _, t := range times {
			if t.After(windowStart) {
				valid = append(valid, t)
			}
		}
		if len(valid) == 0 {
			delete(rl.requests, key)
		} else {
			rl.requests[key] = valid
		}
	}
}

// Middleware de rate limiting
func RateLimitMiddleware(limiter *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			c.Next()
			return
		}

		if !limiter.Allow(uid) {
			c.JSON(429, gin.H{
				"error": "Demasiadas peticiones. Por favor, espera un momento antes de intentar de nuevo.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

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

	// ===== INICIALIZAR CACHÉ =====
	cacheInstance := cache.NewCache(5 * time.Minute)
	log.Println("✅ Caché en memoria inicializado (TTL: 5 minutos)")

	// ===== RATE LIMITER =====
	rateLimiter := NewRateLimiter(20, 1*time.Minute) // 20 requests por minuto
	log.Println("✅ Rate limiter inicializado (20 req/min por usuario)")

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

	// ===== HANDLERS Y MIDDLEWARE =====
	h := handlers.NewHandler(firestoreClient, authClient, cacheInstance)
	pm := middleware.NewPermissionsMiddleware(firestoreClient, cacheInstance)

	// ===== RUTAS PÚBLICAS =====
	public := r.Group("/api")
	{
		public.GET("/health", func(c *gin.Context) {
			// ✅ HEALTH CHECK MEJORADO
			healthCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
			defer cancel()

			firestoreStatus := "ok"
			_, err := firestoreClient.Collection("users").Limit(1).Documents(healthCtx).Next()
			if err != nil && err != iterator.Done {
				firestoreStatus = "degraded"
			}

			stats := cacheInstance.Stats()

			c.JSON(200, gin.H{
				"status":    "ok",
				"env":       env,
				"timestamp": time.Now().Format(time.RFC3339),
				"services": gin.H{
					"firestore": firestoreStatus,
					"cache":     "ok",
				},
				"cache_stats": stats,
			})
		})
	}

	// ===== RUTAS PROTEGIDAS =====
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(authClient))
	{
		// ===== USUARIOS =====
		protected.GET("/users/me", h.GetCurrentUser)

		// ===== CAMPAÑAS (con rate limiting) =====
		protected.POST("/campaigns", RateLimitMiddleware(rateLimiter), h.CreateEvent)
		protected.GET("/campaigns", h.GetUserEvents)
		protected.GET("/campaigns/:id/full", pm.RequireCampaignMember(), h.GetCampaignFullData)
		protected.GET("/campaigns/:id", h.GetEvent)
		protected.DELETE("/campaigns/:id", pm.RequireCampaignDM(), h.DeleteEvent)

		// ===== MIEMBROS DE CAMPAÑA =====
		protected.POST("/campaigns/:id/invite", pm.RequireCampaignDM(), RateLimitMiddleware(rateLimiter), h.InvitePlayer)
		protected.DELETE("/campaigns/:id/players/:userId", pm.RequireCampaignDM(), h.RemovePlayer)
		protected.GET("/campaigns/:id/members", h.GetEventMembers)

		// ===== INVITACIONES =====
		protected.GET("/invitations", h.GetMyInvitations)
		protected.POST("/invitations/:id/respond", h.RespondToInvitation)

		// ===== PERSONAJES (con rate limiting) =====
		protected.POST("/campaigns/:id/characters", pm.RequireCampaignMember(), RateLimitMiddleware(rateLimiter), h.CreateCharacter)
		protected.GET("/campaigns/:id/characters", h.GetCampaignCharacters)
		protected.PUT("/characters/:charId", pm.RequireCharacterOwnerOrDM(), h.UpdateCharacter)
		protected.DELETE("/characters/:charId", pm.RequireCharacterOwnerOrDM(), h.DeleteCharacter)

		// ===== ENCUENTROS (con rate limiting) =====
		protected.POST("/campaigns/:id/encounters", pm.RequireCampaignDM(), RateLimitMiddleware(rateLimiter), h.CreateEncounter)
		protected.GET("/campaigns/:id/encounters/active", h.GetActiveEncounter)
		protected.GET("/campaigns/:id/combat/full", pm.RequireCampaignMember(), h.GetCombatFullData)
		protected.DELETE("/encounters/:encounterId", pm.RequireEncounterDM(), h.EndEncounter)
		protected.POST("/encounters/:encounterId/reset", pm.RequireEncounterDM(), h.ResetEncounter)

		// ===== COMBATIENTES (con rate limiting en POST) =====
		protected.POST("/encounters/:encounterId/combatants", pm.RequireEncounterDM(), RateLimitMiddleware(rateLimiter), h.AddCombatant)
		protected.GET("/encounters/:encounterId/combatants", h.GetCombatants)
		protected.PUT("/combatants/:combatantId", h.UpdateCombatant)
		protected.DELETE("/combatants/:combatantId", h.RemoveCombatant)

		// ===== TURNOS =====
		protected.POST("/encounters/:encounterId/next-turn", pm.RequireEncounterDM(), h.NextTurn)

		// ===== NOTAS (con rate limiting en POST) =====
		protected.POST("/campaigns/:id/notes", pm.RequireCampaignMember(), RateLimitMiddleware(rateLimiter), h.CreateNote)
		protected.GET("/campaigns/:id/notes", pm.RequireCampaignMember(), h.GetCampaignNotes)
		protected.GET("/notes/:noteId", h.GetNote)
		protected.PUT("/notes/:noteId", h.UpdateNote)
		protected.DELETE("/notes/:noteId", h.DeleteNote)

		// ===== CACHÉ MANAGEMENT =====
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
	log.Printf("   - Caché en memoria (TTL: 5 min)")
	log.Printf("   - Rate limiting (20 req/min por usuario)")
	log.Printf("   - Middleware de permisos centralizado")
	log.Printf("   - Queries paralelas con goroutines")
	log.Printf("   - Eliminación en cascada")
	log.Printf("   - Limpieza automática de datos antiguos")
	log.Printf("   - Validaciones de input mejoradas")

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
