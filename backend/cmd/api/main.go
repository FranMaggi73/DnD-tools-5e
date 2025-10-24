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

	"github.com/FranMaggi73/dm-events-backend/internal/handlers"
	"github.com/FranMaggi73/dm-events-backend/internal/middleware"
)

func main() {
	ctx := context.Background()

	// Inicializar Firebase
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

	// Router Gin
	r := gin.Default()

	// CORS actualizado para producción
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // temporal, lo cambiaremos según env
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // si usás cookies o autenticación que requiera credenciales. Si no, podés poner false.
		MaxAge:           12 * time.Hour,
	}

	env := os.Getenv("ENV")
	if env == "production" {
		// PRODUCCIÓN: Solo tu dominio de Firebase Hosting
		config.AllowOrigins = []string{
			"https://dnd5etools-73.web.app",
			"https://dnd5etools-73.firebaseapp.com",
		}
		log.Println("🌐 CORS configurado para PRODUCCIÓN")
	} else {
		// DESARROLLO: localhost
		config.AllowOrigins = []string{"http://localhost:5173"}
		log.Println("🛠️  CORS configurado para DESARROLLO")
	}

	r.Use(cors.New(config))

	// Handlers
	h := handlers.NewHandler(firestoreClient, authClient)

	// Rutas públicas
	public := r.Group("/api")
	{
		public.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "env": env})
		})
	}

	// Rutas protegidas
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(authClient))
	{
		// Usuarios
		protected.GET("/users/me", h.GetCurrentUser)

		// Campañas
		protected.POST("/campaigns", h.CreateEvent)
		protected.GET("/campaigns", h.GetUserEvents)
		protected.GET("/campaigns/:id", h.GetEvent)
		protected.DELETE("/campaigns/:id", h.DeleteEvent)

		// Miembros de campaña
		protected.POST("/campaigns/:id/invite", h.InvitePlayer)
		protected.DELETE("/campaigns/:id/players/:userId", h.RemovePlayer)
		protected.GET("/campaigns/:id/members", h.GetEventMembers)

		// Invitaciones
		protected.GET("/invitations", h.GetMyInvitations)
		protected.POST("/invitations/:id/respond", h.RespondToInvitation)

		// Personajes
		protected.POST("/campaigns/:id/characters", h.CreateCharacter)
		protected.GET("/campaigns/:id/characters", h.GetCampaignCharacters)
		protected.PUT("/characters/:charId", h.UpdateCharacter)
		protected.DELETE("/characters/:charId", h.DeleteCharacter)

		// Encuentros
		protected.POST("/campaigns/:id/encounters", h.CreateEncounter)
		protected.GET("/campaigns/:id/encounters/active", h.GetActiveEncounter)
		protected.DELETE("/encounters/:encounterId", h.EndEncounter)
		protected.POST("/encounters/:encounterId/reset", h.ResetEncounter)

		// Combatientes
		protected.POST("/encounters/:encounterId/combatants", h.AddCombatant)
		protected.GET("/encounters/:encounterId/combatants", h.GetCombatants)
		protected.PUT("/combatants/:combatantId", h.UpdateCombatant)
		protected.DELETE("/combatants/:combatantId", h.RemoveCombatant)

		// Turnos
		protected.POST("/encounters/:encounterId/next-turn", h.NextTurn)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Servidor corriendo en puerto %s", port)
	r.Run(":" + port)
}

func startsWithHTTP(origin string) bool {
	return len(origin) >= 7 && (origin[:7] == "http://" || (len(origin) >= 8 && origin[:8] == "https://"))
}
