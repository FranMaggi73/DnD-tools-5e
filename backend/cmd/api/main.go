package main

import (
	"context"
	"log"
	"os"

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

	// CORS dinámico
	config := cors.DefaultConfig()
	config.AllowHeaders = []string{"Authorization", "Content-Type"}

	// Detectar modo de ejecución
	if gin.Mode() == gin.DebugMode {
		// Desarrollo: permitir localhost Vite y cualquier origen Capacitor
		config.AllowOrigins = []string{"http://localhost:5173"}
		config.AllowOriginFunc = func(origin string) bool {
			// Permitir todos los esquemas que no sean HTTP/HTTPS (para Capacitor)
			if origin != "" && !startsWithHTTP(origin) {
				return true
			}
			return false
		}
	} else {
		// Producción: solo tu dominio seguro
		config.AllowOrigins = []string{"https://tudominio.com"}
	}

	r.Use(cors.New(config))

	// Handlers
	h := handlers.NewHandler(firestoreClient, authClient)

	// Rutas públicas
	public := r.Group("/api")
	public.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Rutas protegidas
	// Rutas protegidas
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(authClient))
	{
		// Usuarios
		protected.GET("/users/me", h.GetCurrentUser)

		// Eventos
		protected.POST("/events", h.CreateEvent)
		protected.GET("/events", h.GetUserEvents)
		protected.GET("/events/:id", h.GetEvent)
		protected.DELETE("/events/:id", h.DeleteEvent)

		// Miembros
		protected.POST("/events/:id/invite", h.InvitePlayer)
		protected.DELETE("/events/:id/players/:userId", h.RemovePlayer)
		protected.GET("/events/:id/members", h.GetEventMembers)

		// Invitaciones (NUEVO)
		protected.GET("/invitations", h.GetMyInvitations)
		protected.POST("/invitations/:id/respond", h.RespondToInvitation)
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor corriendo en puerto %s", port)
	r.Run(":" + port)
}

// startsWithHTTP retorna true si el origen empieza con http:// o https://
func startsWithHTTP(origin string) bool {
	return len(origin) >= 7 && (origin[:7] == "http://" || (len(origin) >= 8 && origin[:8] == "https://"))
}
