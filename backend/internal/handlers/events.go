package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

type Handler struct {
	db   *firestore.Client
	auth *auth.Client
}

func NewHandler(db *firestore.Client, auth *auth.Client) *Handler {
	return &Handler{db: db, auth: auth}
}

// ===========================
// USUARIOS
// ===========================

func (h *Handler) GetCurrentUser(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing uid (not authenticated)"})
		return
	}
	ctx := context.Background()

	doc, err := h.db.Collection("users").Doc(uid).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	var user models.User
	if err := doc.DataTo(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando usuario"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// ===========================
// EVENTOS
// ===========================

func (h *Handler) CreateEvent(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing uid (not authenticated)"})
		return
	}
	ctx := context.Background()

	// Bind request temprano (validación)
	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Intentamos obtener el doc del usuario
	userRef := h.db.Collection("users").Doc(uid)
	userDoc, err := userRef.Get(ctx)
	var user models.User

	if err != nil {
		// Si no existe, creamos el documento de usuario usando Firebase Auth
		if status.Code(err) == codes.NotFound {
			log.Printf("CreateEvent: users doc not found for uid=%s, creating from Auth", uid)

			// obtener info desde Firebase Auth
			fbUser, authErr := h.auth.GetUser(ctx, uid)
			if authErr != nil {
				log.Printf("CreateEvent: failed to GetUser from Auth for uid=%s: %v", uid, authErr)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario desde Auth"})
				return
			}

			newUser := models.User{
				UID:         uid,
				Email:       fbUser.Email,
				DisplayName: fbUser.DisplayName,
				PhotoURL:    fbUser.PhotoURL,
				CreatedAt:   time.Now(),
				EventCount:  0,
			}

			if _, err := userRef.Set(ctx, newUser); err != nil {
				log.Printf("CreateEvent: failed to create users doc for uid=%s: %v", uid, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando usuario"})
				return
			}

			user = newUser
		} else {
			log.Printf("CreateEvent: error getting users doc uid=%s: %v", uid, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario"})
			return
		}
	} else {
		// Si userDoc existe, parsearlo
		if err := userDoc.DataTo(&user); err != nil {
			log.Printf("CreateEvent: DataTo user failed uid=%s: %v", uid, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando usuario"})
			return
		}
	}

	// Revisar límite de eventos
	if user.EventCount >= 3 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Has alcanzado el límite de 3 eventos"})
		return
	}

	// Crear evento
	eventRef := h.db.Collection("events").NewDoc()
	event := models.Event{
		ID:          eventRef.ID,
		Name:        req.Name,
		Description: req.Description,
		DmID:        uid,
		DmName:      user.DisplayName,
		DmPhoto:     user.PhotoURL,
		CreatedAt:   time.Now(),
		PlayerIDs:   []string{},
	}

	// Transacción para crear evento + miembro DM + incrementar contador
	err = h.db.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		if err := tx.Set(eventRef, event); err != nil {
			return err
		}

		memberRef := h.db.Collection("event_members").NewDoc()
		member := models.EventMember{
			EventID:   event.ID,
			UserID:    uid,
			Role:      "dm",
			UserName:  user.DisplayName,
			UserPhoto: user.PhotoURL,
			JoinedAt:  time.Now(),
		}
		if err := tx.Set(memberRef, member); err != nil {
			return err
		}

		userRef := h.db.Collection("users").Doc(uid)
		return tx.Update(userRef, []firestore.Update{
			{Path: "eventCount", Value: firestore.Increment(1)},
		})
	})

	if err != nil {
		log.Printf("CreateEvent: transaction failed uid=%s err=%v", uid, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando evento"})
		return
	}

	c.JSON(http.StatusCreated, event)
}

func (h *Handler) GetUserEvents(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	ctx := context.Background()

	// Buscar eventos donde el usuario es miembro (DM o jugador)
	memberIter := h.db.Collection("event_members").
		Where("userId", "==", uid).
		Documents(ctx)

	eventIDs := make(map[string]bool)
	for {
		doc, err := memberIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error buscando eventos"})
			return
		}

		var member models.EventMember
		if err := doc.DataTo(&member); err != nil {
			continue
		}
		eventIDs[member.EventID] = true
	}

	// Obtener detalles de los eventos
	var events []models.Event
	for eventID := range eventIDs {
		eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
		if err != nil {
			continue
		}

		var event models.Event
		if err := eventDoc.DataTo(&event); err != nil {
			continue
		}
		events = append(events, event)
	}

	if events == nil {
		events = []models.Event{}
	}

	c.JSON(http.StatusOK, events)
}

func (h *Handler) GetEvent(c *gin.Context) {
	eventID := c.Param("id")
	ctx := context.Background()

	doc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	var event models.Event
	if err := doc.DataTo(&event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando evento"})
		return
	}
	c.JSON(http.StatusOK, event)
}

func (h *Handler) DeleteEvent(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing uid (not authenticated)"})
		return
	}
	eventID := c.Param("id")
	ctx := context.Background()

	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	var event models.Event
	if err := eventDoc.DataTo(&event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando evento"})
		return
	}

	if event.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede eliminar el evento"})
		return
	}

	// Transacción: eliminar evento + miembros + decrementar contador
	err = h.db.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		if err := tx.Delete(h.db.Collection("events").Doc(eventID)); err != nil {
			return err
		}

		iter := h.db.Collection("event_members").
			Where("eventId", "==", eventID).
			Documents(ctx)
		for {
			doc, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				return err
			}
			if err := tx.Delete(doc.Ref); err != nil {
				return err
			}
		}

		userRef := h.db.Collection("users").Doc(uid)
		return tx.Update(userRef, []firestore.Update{
			{Path: "eventCount", Value: firestore.Increment(-1)},
		})
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando evento"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Evento eliminado"})
}

// ===========================
// PARTICIPANTES
// ===========================

func (h *Handler) GetEventMembers(c *gin.Context) {
	eventID := c.Param("id")
	ctx := context.Background()

	iter := h.db.Collection("event_members").
		Where("eventId", "==", eventID).
		Documents(ctx)

	var members []models.EventMember
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo miembros"})
			return
		}
		var member models.EventMember
		if err := doc.DataTo(&member); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando miembro"})
			return
		}
		members = append(members, member)
	}

	var dm *models.EventMember
	var players []models.EventMember
	for _, m := range members {
		if m.Role == "dm" {
			dm = &m
		} else {
			players = append(players, m)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"dm":      dm,
		"players": players,
	})
}

func (h *Handler) InvitePlayer(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	eventID := c.Param("id")
	ctx := context.Background()

	var req struct {
		UserEmail string `json:"userEmail" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar que el evento existe y el usuario es el DM
	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	var event models.Event
	if err := eventDoc.DataTo(&event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando evento"})
		return
	}

	if event.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede invitar jugadores"})
		return
	}

	// Buscar usuario por email
	userRecord, err := h.auth.GetUserByEmail(ctx, req.UserEmail)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado con ese email"})
		return
	}

	playerUID := userRecord.UID

	if playerUID == uid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes invitarte a ti mismo"})
		return
	}

	// Verificar que no esté ya en el evento
	existingMember := h.db.Collection("event_members").
		Where("eventId", "==", eventID).
		Where("userId", "==", playerUID).
		Limit(1).
		Documents(ctx)

	_, err = existingMember.Next()
	if err != iterator.Done {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El usuario ya es miembro del evento"})
		return
	}

	// Verificar que no tenga invitación pendiente
	existingInv := h.db.Collection("invitations").
		Where("eventId", "==", eventID).
		Where("toUserId", "==", playerUID).
		Where("status", "==", "pending").
		Limit(1).
		Documents(ctx)

	_, err = existingInv.Next()
	if err != iterator.Done {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El usuario ya tiene una invitación pendiente"})
		return
	}

	// Obtener datos del DM
	dmDoc, err := h.db.Collection("users").Doc(uid).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo datos del DM"})
		return
	}

	var dm models.User
	if err := dmDoc.DataTo(&dm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando DM"})
		return
	}

	// Crear invitación
	invRef := h.db.Collection("invitations").NewDoc()
	invitation := models.Invitation{
		ID:         invRef.ID,
		EventID:    eventID,
		EventName:  event.Name,
		EventDesc:  event.Description,
		FromUserID: uid,
		FromName:   dm.DisplayName,
		FromPhoto:  dm.PhotoURL,
		ToUserID:   playerUID,
		ToEmail:    req.UserEmail,
		Status:     "pending",
		CreatedAt:  time.Now(),
	}

	if _, err := invRef.Set(ctx, invitation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando invitación"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Invitación enviada exitosamente",
		"invitation": invitation,
	})
}
func (h *Handler) RemovePlayer(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing uid (not authenticated)"})
		return
	}
	eventID := c.Param("id")
	playerID := c.Param("userId")
	ctx := context.Background()

	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	var event models.Event
	if err := eventDoc.DataTo(&event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando evento"})
		return
	}

	if event.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede eliminar jugadores"})
		return
	}

	if playerID == uid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes eliminarte como DM"})
		return
	}

	iter := h.db.Collection("event_members").
		Where("eventId", "==", eventID).
		Where("userId", "==", playerID).
		Documents(ctx)

	doc, err := iter.Next()
	if err == iterator.Done {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jugador no encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error buscando jugador"})
		return
	}

	if _, err := doc.Ref.Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando jugador"})
		return
	}

	if _, err := h.db.Collection("events").Doc(eventID).Update(ctx, []firestore.Update{
		{Path: "playerIds", Value: firestore.ArrayRemove(playerID)},
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando playerIds"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Jugador eliminado"})
}
