package main

import (
	"context"
	"log"
	"os"
	"time"

	firebase "firebase.google.com/go/v4"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

		// ===== CACHÉ MANAGEMENT =====
		protected.POST("/cache/clear", h.ClearCache)
		protected.GET("/cache/stats", h.GetCacheStats)
	}

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

	r.Run(":" + port)
}
