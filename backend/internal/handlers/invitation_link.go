package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// GenerateInvitationLink genera un link de invitación único
func (h *Handler) GenerateInvitationLink(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	campaignID := c.Param("id")
	ctx := context.Background()

	var req models.CreateInvitationLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar que es DM
	campaignDoc, err := h.db.Collection("events").Doc(campaignID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	if err := campaignDoc.DataTo(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
		return
	}

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede crear links de invitación"})
		return
	}

	// Generar código único
	code, err := generateUniqueCode(8)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando código"})
		return
	}

	// Verificar que el código no existe
	existingIter := h.db.Collection("invitation_links").
		Where("code", "==", code).
		Limit(1).
		Documents(ctx)

	_, err = existingIter.Next()
	if err != iterator.Done {
		// Código ya existe, reintentar
		code, _ = generateUniqueCode(10)
	}

	linkRef := h.db.Collection("invitation_links").NewDoc()
	link := models.InvitationLink{
		ID:         linkRef.ID,
		Code:       code,
		CampaignID: campaignID,
		CreatedBy:  uid,
		CreatedAt:  time.Now(),
		ExpiresAt:  time.Now().AddDate(0, 0, req.ExpiresIn),
		MaxUses:    req.MaxUses,
		UsedCount:  0,
		IsActive:   true,
	}

	if _, err := linkRef.Set(ctx, link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando link"})
		return
	}

	c.JSON(http.StatusCreated, link)
}

// GetCampaignInvitationLinks obtiene los links activos de una campaña
func (h *Handler) GetCampaignInvitationLinks(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	campaignID := c.Param("id")
	ctx := context.Background()

	// Verificar que es DM
	campaignDoc, err := h.db.Collection("events").Doc(campaignID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	if err := campaignDoc.DataTo(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
		return
	}

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede ver los links"})
		return
	}

	iter := h.db.Collection("invitation_links").
		Where("campaignId", "==", campaignID).
		Where("isActive", "==", true).
		Documents(ctx)

	var links []models.InvitationLink
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			continue
		}

		var link models.InvitationLink
		if err := doc.DataTo(&link); err != nil {
			continue
		}
		links = append(links, link)
	}

	if links == nil {
		links = []models.InvitationLink{}
	}

	c.JSON(http.StatusOK, links)
}

// DeactivateInvitationLink desactiva un link de invitación
func (h *Handler) DeactivateInvitationLink(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	code := c.Param("code")
	ctx := context.Background()

	// Buscar el link
	linkIter := h.db.Collection("invitation_links").
		Where("code", "==", code).
		Limit(1).
		Documents(ctx)

	linkDoc, err := linkIter.Next()
	if err == iterator.Done {
		c.JSON(http.StatusNotFound, gin.H{"error": "Link no encontrado"})
		return
	}

	var link models.InvitationLink
	if err := linkDoc.DataTo(&link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando link"})
		return
	}

	// Verificar que es el creador
	if link.CreatedBy != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el creador puede desactivar el link"})
		return
	}

	// Desactivar
	if _, err := linkDoc.Ref.Update(ctx, []firestore.Update{
		{Path: "isActive", Value: false},
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error desactivando link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Link desactivado"})
}

// JoinCampaignWithCode permite unirse a una campaña con código
func (h *Handler) JoinCampaignWithCode(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	code := c.Param("code")
	ctx := context.Background()

	// Buscar el link
	linkIter := h.db.Collection("invitation_links").
		Where("code", "==", code).
		Limit(1).
		Documents(ctx)

	linkDoc, err := linkIter.Next()
	if err == iterator.Done {
		c.JSON(http.StatusNotFound, gin.H{"error": "Código de invitación no válido"})
		return
	}

	var link models.InvitationLink
	if err := linkDoc.DataTo(&link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando link"})
		return
	}

	// Validaciones
	if !link.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Este link ya no está activo"})
		return
	}

	if time.Now().After(link.ExpiresAt) {
		// Desactivar automáticamente
		linkDoc.Ref.Update(ctx, []firestore.Update{
			{Path: "isActive", Value: false},
		})
		c.JSON(http.StatusBadRequest, gin.H{"error": "Este link ha expirado"})
		return
	}

	if link.MaxUses != -1 && link.UsedCount >= link.MaxUses {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Este link ha alcanzado el máximo de usos"})
		return
	}

	// Verificar que no es miembro ya
	existingMember := h.db.Collection("event_members").
		Where("campaignId", "==", link.CampaignID).
		Where("userId", "==", uid).
		Limit(1).
		Documents(ctx)

	_, err = existingMember.Next()
	if err != iterator.Done {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ya eres miembro de esta campaña"})
		return
	}

	// Transacción para agregar miembro
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

		// Crear miembro
		memberRef := h.db.Collection("event_members").NewDoc()
		member := models.CampaignMember{
			CampaignID: link.CampaignID,
			UserID:     uid,
			Role:       "player",
			UserName:   user.DisplayName,
			UserPhoto:  user.PhotoURL,
			JoinedAt:   time.Now(),
		}
		if err := tx.Set(memberRef, member); err != nil {
			return err
		}

		// Actualizar playerIds
		eventRef := h.db.Collection("events").Doc(link.CampaignID)
		if err := tx.Update(eventRef, []firestore.Update{
			{Path: "playerIds", Value: firestore.ArrayUnion(uid)},
		}); err != nil {
			return err
		}

		// Incrementar usedCount
		return tx.Update(linkDoc.Ref, []firestore.Update{
			{Path: "usedCount", Value: firestore.Increment(1)},
		})
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error uniéndose a la campaña"})
		return
	}

	// Obtener campaña
	campaignDoc, _ := h.db.Collection("events").Doc(link.CampaignID).Get(ctx)
	var campaign models.Campaign
	campaignDoc.DataTo(&campaign)

	c.JSON(http.StatusOK, gin.H{
		"message":  "Te has unido a la campaña exitosamente",
		"campaign": campaign,
	})
}

// Helper para generar código único
func generateUniqueCode(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes)[:length], nil
}
