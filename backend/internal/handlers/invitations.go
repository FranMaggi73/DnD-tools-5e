package handlers

import (
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// ===========================
// INVITACIONES
// ===========================

// GetMyInvitations obtiene las invitaciones pendientes del usuario
func (h *Handler) GetMyInvitations(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	ctx := context.Background()

	iter := h.db.Collection("invitations").
		Where("toUserId", "==", uid).
		Where("status", "==", "pending").
		OrderBy("createdAt", firestore.Desc).
		Documents(ctx)

	var invitations []models.Invitation
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo invitaciones"})
			return
		}

		var inv models.Invitation
		if err := doc.DataTo(&inv); err != nil {
			continue
		}
		invitations = append(invitations, inv)
	}

	if invitations == nil {
		invitations = []models.Invitation{}
	}

	c.JSON(http.StatusOK, invitations)
}

// RespondToInvitation acepta o rechaza una invitación
func (h *Handler) RespondToInvitation(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	invitationID := c.Param("id")
	ctx := context.Background()

	var req struct {
		Action string `json:"action" binding:"required"` // "accept" o "reject"
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Action != "accept" && req.Action != "reject" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Acción inválida"})
		return
	}

	// Obtener invitación
	invRef := h.db.Collection("invitations").Doc(invitationID)
	invDoc, err := invRef.Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitación no encontrada"})
		return
	}

	var invitation models.Invitation
	if err := invDoc.DataTo(&invitation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando invitación"})
		return
	}

	// Verificar que la invitación es para este usuario
	if invitation.ToUserID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Esta invitación no es para ti"})
		return
	}

	// Verificar que está pendiente
	if invitation.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Esta invitación ya fue respondida"})
		return
	}

	// Actualizar status de la invitación
	newStatus := "rejected"
	if req.Action == "accept" {
		newStatus = "accepted"
	}

	// Transacción para actualizar invitación y agregar miembro si acepta
	err = h.db.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Actualizar invitación
		if err := tx.Update(invRef, []firestore.Update{
			{Path: "status", Value: newStatus},
			{Path: "respondedAt", Value: time.Now()},
		}); err != nil {
			return err
		}

		// Si aceptó, agregar como miembro del evento
		if req.Action == "accept" {
			// Obtener datos del usuario
			userDoc, err := h.db.Collection("users").Doc(uid).Get(ctx)
			var user models.User

			if err != nil {
				if status.Code(err) == codes.NotFound {
					// Crear usuario desde Auth
					fbUser, authErr := h.auth.GetUser(ctx, uid)
					if authErr != nil {
						return authErr
					}
					user = models.User{
						UID:         uid,
						Email:       fbUser.Email,
						DisplayName: fbUser.DisplayName,
						PhotoURL:    fbUser.PhotoURL,
						CreatedAt:   time.Now(),
						EventCount:  0,
					}
					if _, err := h.db.Collection("users").Doc(uid).Set(ctx, user); err != nil {
						return err
					}
				} else {
					return err
				}
			} else {
				if err := userDoc.DataTo(&user); err != nil {
					return err
				}
			}

			// Crear miembro del evento
			memberRef := h.db.Collection("event_members").NewDoc()
			member := models.EventMember{
				EventID:   invitation.EventID,
				UserID:    uid,
				Role:      "player",
				UserName:  user.DisplayName,
				UserPhoto: user.PhotoURL,
				JoinedAt:  time.Now(),
			}
			if err := tx.Set(memberRef, member); err != nil {
				return err
			}

			// Actualizar playerIds en evento
			eventRef := h.db.Collection("events").Doc(invitation.EventID)
			return tx.Update(eventRef, []firestore.Update{
				{Path: "playerIds", Value: firestore.ArrayUnion(uid)},
			})
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error procesando respuesta"})
		return
	}

	message := "Invitación rechazada"
	if req.Action == "accept" {
		message = "Te has unido al evento exitosamente"
	}

	c.JSON(http.StatusOK, gin.H{"message": message})
}
