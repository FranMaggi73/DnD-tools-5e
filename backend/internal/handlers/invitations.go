// backend/internal/handlers/invitations.go
package handlers

import (
	"context"
	"log"
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

	// ===== MEJORA: Eliminar invitación directamente en lugar de actualizar status =====
	message := "Invitación rechazada"

	if req.Action == "accept" {
		// Transacción para agregar miembro y eliminar invitación
		err = h.db.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
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
						UID:           uid,
						Email:         fbUser.Email,
						DisplayName:   fbUser.DisplayName,
						PhotoURL:      fbUser.PhotoURL,
						CreatedAt:     time.Now(),
						CampaignCount: 0,
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
			member := models.CampaignMember{
				CampaignID: invitation.CampaignID,
				UserID:     uid,
				Role:       "player",
				UserName:   user.DisplayName,
				UserPhoto:  user.PhotoURL,
				JoinedAt:   time.Now(),
			}
			if err := tx.Set(memberRef, member); err != nil {
				return err
			}

			// Actualizar playerIds en evento
			eventRef := h.db.Collection("events").Doc(invitation.CampaignID)
			if err := tx.Update(eventRef, []firestore.Update{
				{Path: "playerIds", Value: firestore.ArrayUnion(uid)},
			}); err != nil {
				return err
			}

			// ===== ELIMINAR invitación en lugar de actualizar =====
			return tx.Delete(invRef)
		})

		if err != nil {
			log.Printf("❌ Error aceptando invitación: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error procesando respuesta"})
			return
		}

		message = "Te has unido al evento exitosamente"
		log.Printf("✅ Invitación aceptada y eliminada: %s", invitationID)

	} else {
		// Rechazar: simplemente eliminar la invitación
		if _, err := invRef.Delete(ctx); err != nil {
			log.Printf("❌ Error rechazando invitación: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error procesando respuesta"})
			return
		}
		log.Printf("🗑️ Invitación rechazada y eliminada: %s", invitationID)
	}

	c.JSON(http.StatusOK, gin.H{"message": message})
}

// ===========================
// LIMPIEZA DE INVITACIONES ANTIGUAS
// ===========================

// CleanupOldInvitations elimina invitaciones respondidas hace más de 30 días
// Esta función puede ser llamada periódicamente por un cron job
func (h *Handler) CleanupOldInvitations(c *gin.Context) {
	ctx := context.Background()

	// Fecha límite: 30 días atrás
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	// Buscar invitaciones antiguas aceptadas/rechazadas
	iter := h.db.Collection("invitations").
		Where("status", "in", []string{"accepted", "rejected"}).
		Where("respondedAt", "<", thirtyDaysAgo).
		Documents(ctx)

	deletedCount := 0
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			continue
		}

		if _, err := doc.Ref.Delete(ctx); err != nil {
			log.Printf("Error eliminando invitación antigua: %v", err)
			continue
		}
		deletedCount++
	}

	log.Printf("✅ Limpieza de invitaciones: %d invitaciones antiguas eliminadas", deletedCount)

	c.JSON(http.StatusOK, gin.H{
		"message":      "Invitaciones antiguas limpiadas",
		"deletedCount": deletedCount,
		"olderThan":    "30 días",
	})
}
