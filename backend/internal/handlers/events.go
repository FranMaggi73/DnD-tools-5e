package handlers

import (
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

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
	ctx := context.Background()

	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar límite de eventos
	userDoc, err := h.db.Collection("users").Doc(uid).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario"})
		return
	}

	var user models.User
	userDoc.DataTo(&user)

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

	// Transacción: crear evento + miembro DM + incrementar contador
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando evento"})
		return
	}

	c.JSON(http.StatusCreated, event)
}

func (h *Handler) GetUserEvents(c *gin.Context) {
	uid := c.GetString("uid")
	ctx := context.Background()

	iter := h.db.Collection("events").
		Where("dmId", "==", uid).
		Documents(ctx)

	var events []models.Event
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo eventos"})
			return
		}

		var e models.Event
		doc.DataTo(&e)
		events = append(events, e)
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
	doc.DataTo(&event)
	c.JSON(http.StatusOK, event)
}

func (h *Handler) DeleteEvent(c *gin.Context) {
	uid := c.GetString("uid")
	eventID := c.Param("id")
	ctx := context.Background()

	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	var event models.Event
	eventDoc.DataTo(&event)

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
		doc.DataTo(&member)
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
	eventID := c.Param("id")
	ctx := context.Background()

	var req struct {
		UserID    string `json:"userId"`
		UserName  string `json:"userName"`
		UserPhoto string `json:"userPhoto"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	var event models.Event
	eventDoc.DataTo(&event)

	if event.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede invitar jugadores"})
		return
	}

	memberRef := h.db.Collection("event_members").NewDoc()
	member := models.EventMember{
		EventID:   eventID,
		UserID:    req.UserID,
		Role:      "player",
		UserName:  req.UserName,
		UserPhoto: req.UserPhoto,
		JoinedAt:  time.Now(),
	}

	if _, err := memberRef.Set(ctx, member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error invitando jugador"})
		return
	}

	// Actualizar playerIds en evento
	h.db.Collection("events").Doc(eventID).Update(ctx, []firestore.Update{
		{Path: "playerIds", Value: firestore.ArrayUnion(req.UserID)},
	})

	c.JSON(http.StatusOK, member)
}

func (h *Handler) RemovePlayer(c *gin.Context) {
	uid := c.GetString("uid")
	eventID := c.Param("id")
	playerID := c.Param("userId")
	ctx := context.Background()

	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	var event models.Event
	eventDoc.DataTo(&event)

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

	h.db.Collection("events").Doc(eventID).Update(ctx, []firestore.Update{
		{Path: "playerIds", Value: firestore.ArrayRemove(playerID)},
	})

	c.JSON(http.StatusOK, gin.H{"message": "Jugador eliminado"})
}
