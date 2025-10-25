// backend/internal/handlers/handlers.go
package handlers

import (
	"net/http"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"

	"github.com/FranMaggi73/dm-events-backend/internal/cache"
)

type Handler struct {
	db    *firestore.Client
	auth  *auth.Client
	cache *cache.Cache
}

// NewHandler crea una nueva instancia del handler con caché
func NewHandler(db *firestore.Client, auth *auth.Client, cache *cache.Cache) *Handler {
	return &Handler{
		db:    db,
		auth:  auth,
		cache: cache,
	}
}

// ===========================
// ENDPOINTS DE CACHÉ MANAGEMENT
// ===========================

// ClearCache limpia todo el caché (admin only)
func (h *Handler) ClearCache(c *gin.Context) {
	h.cache.Clear()
	c.JSON(http.StatusOK, gin.H{
		"message": "Caché limpiado exitosamente",
	})
}

// GetCacheStats devuelve estadísticas del caché
func (h *Handler) GetCacheStats(c *gin.Context) {
	stats := h.cache.Stats()
	c.JSON(http.StatusOK, stats)
}

// InvalidateCampaignCache invalida el caché de una campaña específica
func (h *Handler) InvalidateCampaignCache(campaignID string) {
	h.cache.InvalidateCampaign(campaignID)
}

// InvalidateEncounterCache invalida el caché de un encuentro específico
func (h *Handler) InvalidateEncounterCache(encounterID string) {
	h.cache.InvalidateEncounter(encounterID)
}
