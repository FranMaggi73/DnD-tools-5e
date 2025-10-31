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
)

func main() {
	ctx := context.Background()

	// ===== INICIALIZAR FIREBASE =====
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Error inicializando Firebase: %v", err)
	}

	// Cliente de Firestore
	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Error obteniendo cliente Firestore: %v", err)
	}
	defer firestoreClient.Close()

	// Cliente de Auth
	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("Error obteniendo cliente Auth: %v", err)
	}

	// ===== INICIALIZAR CACHÉ =====
	// TTL de 5 minutos para datos que cambian ocasionalmente
	cacheInstance := cache.NewCache(5 * time.Minute)
	log.Println("✅ Caché en memoria inicializado (TTL: 5 minutos)")

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

	// ===== HANDLERS Y MIDDLEWARE DE PERMISOS =====
	h := handlers.NewHandler(firestoreClient, authClient, cacheInstance)
	pm := middleware.NewPermissionsMiddleware(firestoreClient, cacheInstance)

	// ===== RUTAS PÚBLICAS =====
	public := r.Group("/api")
	{
		public.GET("/health", func(c *gin.Context) {
			stats := cacheInstance.Stats()
			c.JSON(200, gin.H{
				"status":      "ok",
				"env":         env,
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

		// ===== CAMPAÑAS =====
		protected.POST("/campaigns", h.CreateEvent)
		protected.GET("/campaigns", h.GetUserEvents)

		// Endpoint optimizado con goroutines y caché
		protected.GET("/campaigns/:id/full", pm.RequireCampaignMember(), h.GetCampaignFullData)

		protected.GET("/campaigns/:id", h.GetEvent)
		protected.DELETE("/campaigns/:id", pm.RequireCampaignDM(), h.DeleteEvent)
		// ===== MIEMBROS DE CAMPAÑA =====
		protected.POST("/campaigns/:id/invite", pm.RequireCampaignDM(), h.InvitePlayer)
		protected.DELETE("/campaigns/:id/players/:userId", pm.RequireCampaignDM(), h.RemovePlayer)
		protected.GET("/campaigns/:id/members", h.GetEventMembers)

		// ===== INVITACIONES =====
		protected.GET("/invitations", h.GetMyInvitations)
		protected.POST("/invitations/:id/respond", h.RespondToInvitation)

		// ===== PERSONAJES =====
		protected.POST("/campaigns/:id/characters", pm.RequireCampaignMember(), h.CreateCharacter)
		protected.GET("/campaigns/:id/characters", h.GetCampaignCharacters)
		protected.PUT("/characters/:charId", pm.RequireCharacterOwnerOrDM(), h.UpdateCharacter)
		protected.DELETE("/characters/:charId", pm.RequireCharacterOwnerOrDM(), h.DeleteCharacter)

		// ===== ENCUENTROS =====
		protected.POST("/campaigns/:id/encounters", pm.RequireCampaignDM(), h.CreateEncounter)
		protected.GET("/campaigns/:id/encounters/active", h.GetActiveEncounter)

		// Endpoint optimizado con goroutines
		protected.GET("/campaigns/:id/combat/full", pm.RequireCampaignMember(), h.GetCombatFullData)

		protected.DELETE("/encounters/:encounterId", pm.RequireEncounterDM(), h.EndEncounter)
		protected.POST("/encounters/:encounterId/reset", pm.RequireEncounterDM(), h.ResetEncounter)

		// ===== COMBATIENTES =====
		protected.POST("/encounters/:encounterId/combatants", pm.RequireEncounterDM(), h.AddCombatant)
		protected.GET("/encounters/:encounterId/combatants", h.GetCombatants)
		protected.PUT("/combatants/:combatantId", h.UpdateCombatant)
		protected.DELETE("/combatants/:combatantId", h.RemoveCombatant)

		// ===== TURNOS =====
		protected.POST("/encounters/:encounterId/next-turn", pm.RequireEncounterDM(), h.NextTurn)

		// ===== NOTAS =====
		protected.POST("/campaigns/:id/notes", pm.RequireCampaignMember(), h.CreateNote)
		protected.GET("/campaigns/:id/notes", pm.RequireCampaignMember(), h.GetCampaignNotes)
		protected.GET("/notes/:noteId", h.GetNote)
		protected.PUT("/notes/:noteId", h.UpdateNote)
		protected.DELETE("/notes/:noteId", h.DeleteNote)

		// ===== CACHÉ MANAGEMENT =====
		protected.POST("/cache/clear", h.ClearCache)
		protected.GET("/cache/stats", h.GetCacheStats)

	}

	// ===== CRON JOB PARA LIMPIEZA AUTOMÁTICA =====
	go func() {
		// Esperar 1 hora antes de la primera ejecución
		time.Sleep(1 * time.Hour)

		// Ejecutar cada 24 horas
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		// Primera ejecución inmediata después del delay
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
	log.Printf("   - Middleware de permisos centralizado")
	log.Printf("   - Queries paralelas con goroutines")
	log.Printf("   - Eliminación en cascada")
	log.Printf("   - Limpieza automática de datos antiguos")

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
