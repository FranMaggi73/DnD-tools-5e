// backend/internal/middleware/permissions.go
package middleware

import (
	"context"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"github.com/FranMaggi73/dm-events-backend/internal/cache"
	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// PermissionsMiddleware contiene el cliente de Firestore y caché
type PermissionsMiddleware struct {
	db    *firestore.Client
	cache *cache.Cache
}

// NewPermissionsMiddleware crea una nueva instancia
func NewPermissionsMiddleware(db *firestore.Client, c *cache.Cache) *PermissionsMiddleware {
	return &PermissionsMiddleware{
		db:    db,
		cache: c,
	}
}

// ===========================
// MIDDLEWARE DE PERMISOS (OPTIMIZADO)
// ===========================

// RequireCampaignDM verifica que el usuario sea el DM de la campaña
func (pm *PermissionsMiddleware) RequireCampaignDM() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
			c.Abort()
			return
		}

		campaignID := c.Param("id")
		if campaignID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de campaña requerido"})
			c.Abort()
			return
		}

		ctx := context.Background()

		// 1. Verificar caché de campaña (solo para obtener DM ID rápido)
		campaign, _, found := pm.cache.GetCampaign(campaignID)
		if !found {
			// Cache miss: buscar en Firestore
			doc, err := pm.db.Collection("events").Doc(campaignID).Get(ctx)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
				c.Abort()
				return
			}

			campaignData := &models.Campaign{}
			if err := doc.DataTo(campaignData); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
				c.Abort()
				return
			}

			campaign = campaignData
			pm.cache.SetCampaign(campaign)
		}

		// 2. Verificar permisos
		if campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede realizar esta acción"})
			c.Abort()
			return
		}

		// 3. Guardar campaña en contexto para reuso
		c.Set("campaign", campaign)
		c.Next()
	}
}

// RequireCampaignMember verifica que el usuario sea miembro de la campaña
func (pm *PermissionsMiddleware) RequireCampaignMember() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
			c.Abort()
			return
		}

		campaignID := c.Param("id")
		if campaignID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de campaña requerido"})
			c.Abort()
			return
		}

		ctx := context.Background()

		// Verificar si es miembro (siempre consulta Firestore, es rápido)
		memberIter := pm.db.Collection("event_members").
			Where("campaignId", "==", campaignID).
			Where("userId", "==", uid).
			Limit(1).
			Documents(ctx)

		_, err := memberIter.Next()
		if err == iterator.Done {
			c.JSON(http.StatusForbidden, gin.H{"error": "No eres miembro de esta campaña"})
			c.Abort()
			return
		}

		// Obtener campaña de caché si está disponible (opcional, para contexto)
		campaign, _, found := pm.cache.GetCampaign(campaignID)
		if !found {
			doc, err := pm.db.Collection("events").Doc(campaignID).Get(ctx)
			if err == nil {
				campaignData := &models.Campaign{}
				if doc.DataTo(campaignData) == nil {
					campaign = campaignData
					pm.cache.SetCampaign(campaign)
					c.Set("campaign", campaign)
				}
			}
		} else {
			c.Set("campaign", campaign)
		}

		c.Next()
	}
}

// RequireCharacterOwnerOrDM verifica que el usuario sea dueño del personaje o DM
func (pm *PermissionsMiddleware) RequireCharacterOwnerOrDM() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
			c.Abort()
			return
		}

		charID := c.Param("charId")
		if charID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de personaje requerido"})
			c.Abort()
			return
		}

		ctx := context.Background()

		// Obtener personaje (no cacheamos personajes porque cambian frecuentemente)
		charDoc, err := pm.db.Collection("characters").Doc(charID).Get(ctx)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Personaje no encontrado"})
			c.Abort()
			return
		}

		var character models.Character
		if err := charDoc.DataTo(&character); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando personaje"})
			c.Abort()
			return
		}

		// Verificar si es el dueño
		if character.UserID == uid {
			c.Set("character", &character)
			c.Next()
			return
		}

		// Si no es el dueño, verificar si es el DM
		campaign, _, found := pm.cache.GetCampaign(character.CampaignID)
		if !found {
			campaignDoc, err := pm.db.Collection("events").Doc(character.CampaignID).Get(ctx)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
				c.Abort()
				return
			}

			campaignData := &models.Campaign{}
			if err := campaignDoc.DataTo(campaignData); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
				c.Abort()
				return
			}

			campaign = campaignData
			pm.cache.SetCampaign(campaign)
		}

		if campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permisos para modificar este personaje"})
			c.Abort()
			return
		}

		c.Set("character", &character)
		c.Set("campaign", campaign)
		c.Next()
	}
}

// RequireEncounterDM verifica que el usuario sea DM del encuentro
func (pm *PermissionsMiddleware) RequireEncounterDM() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
			c.Abort()
			return
		}

		encounterID := c.Param("encounterId")
		if encounterID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de encuentro requerido"})
			c.Abort()
			return
		}

		ctx := context.Background()

		// Obtener encuentro (cacheamos porque se consulta frecuentemente en combate)
		encounter, _, found := pm.cache.GetEncounter(encounterID)
		if !found {
			encounterDoc, err := pm.db.Collection("encounters").Doc(encounterID).Get(ctx)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Encuentro no encontrado"})
				c.Abort()
				return
			}

			encounterData := &models.Encounter{}
			if err := encounterDoc.DataTo(encounterData); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando encuentro"})
				c.Abort()
				return
			}

			encounter = encounterData
			pm.cache.SetEncounter(encounter)
		}

		// Verificar que el usuario es DM de la campaña del encuentro
		campaign, _, found := pm.cache.GetCampaign(encounter.CampaignID)
		if !found {
			campaignDoc, err := pm.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
				c.Abort()
				return
			}

			campaignData := &models.Campaign{}
			if err := campaignDoc.DataTo(campaignData); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
				c.Abort()
				return
			}

			campaign = campaignData
			pm.cache.SetCampaign(campaign)
		}

		if campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede realizar esta acción"})
			c.Abort()
			return
		}

		c.Set("encounter", encounter)
		c.Set("campaign", campaign)
		c.Next()
	}
}

// ===========================
// HELPERS
// ===========================

// GetCampaignFromContext obtiene la campaña del contexto
func GetCampaignFromContext(c *gin.Context) *models.Campaign {
	if campaign, exists := c.Get("campaign"); exists {
		if camp, ok := campaign.(*models.Campaign); ok {
			return camp
		}
	}
	return nil
}

// GetCharacterFromContext obtiene el personaje del contexto
func GetCharacterFromContext(c *gin.Context) *models.Character {
	if character, exists := c.Get("character"); exists {
		if char, ok := character.(*models.Character); ok {
			return char
		}
	}
	return nil
}

// GetEncounterFromContext obtiene el encuentro del contexto
func GetEncounterFromContext(c *gin.Context) *models.Encounter {
	if encounter, exists := c.Get("encounter"); exists {
		if enc, ok := encounter.(*models.Encounter); ok {
			return enc
		}
	}
	return nil
}
