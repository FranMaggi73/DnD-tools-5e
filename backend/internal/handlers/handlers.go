// backend/internal/handlers/handlers.go
package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"

	"github.com/FranMaggi73/dm-events-backend/internal/cache"
)

type Handler struct {
	db          *firestore.Client
	auth        *auth.Client
	cache       *cache.Cache
	invalidator *cache.CacheInvalidator // ← NUEVO
}

// NewHandler crea handler SIN invalidador (backward compatible)
func NewHandler(db *firestore.Client, auth *auth.Client, cacheInstance *cache.Cache) *Handler {
	return &Handler{
		db:          db,
		auth:        auth,
		cache:       cacheInstance,
		invalidator: nil,
	}
}

// NewHandlerWithInvalidator crea handler CON invalidador distribuido
func NewHandlerWithInvalidator(
	db *firestore.Client,
	auth *auth.Client,
	cacheInstance *cache.Cache,
	invalidator *cache.CacheInvalidator,
) *Handler {
	return &Handler{
		db:          db,
		auth:        auth,
		cache:       cacheInstance,
		invalidator: invalidator,
	}
}

// ===========================
// HELPERS DE INVALIDACIÓN
// ===========================

// invalidateCampaignCache invalida caché de campaña (local + distribuido si está disponible)
func (h *Handler) invalidateCampaignCache(ctx context.Context, campaignID string) {
	if h.invalidator != nil {
		// Invalidación distribuida (todas las instancias)
		if err := h.invalidator.InvalidateCampaign(ctx, campaignID); err != nil {
			// Log error pero no fallar
			log.Printf("⚠️  Error en invalidación distribuida: %v", err)
			// Fallback: invalidar solo local
			h.cache.InvalidateCampaign(campaignID)
		}
	} else {
		// Solo invalidación local
		h.cache.InvalidateCampaign(campaignID)
	}
}

// invalidateEncounterCache invalida caché de encuentro
func (h *Handler) invalidateEncounterCache(ctx context.Context, encounterID string) {
	if h.invalidator != nil {
		if err := h.invalidator.InvalidateEncounter(ctx, encounterID); err != nil {
			log.Printf("⚠️  Error en invalidación distribuida: %v", err)
			h.cache.InvalidateEncounter(encounterID)
		}
	} else {
		h.cache.InvalidateEncounter(encounterID)
	}
}

// invalidatePattern invalida por patrón
func (h *Handler) invalidatePattern(ctx context.Context, pattern string) {
	if h.invalidator != nil {
		if err := h.invalidator.InvalidatePattern(ctx, pattern); err != nil {
			log.Printf("⚠️  Error en invalidación distribuida: %v", err)
			h.cache.InvalidatePattern(pattern)
		}
	} else {
		h.cache.InvalidatePattern(pattern)
	}
}

// ===========================
// ENDPOINTS DE CACHÉ MANAGEMENT
// ===========================

// ClearCache limpia todo el caché (admin only)
func (h *Handler) ClearCache(c *gin.Context) {
	ctx := c.Request.Context()

	if h.invalidator != nil {
		if err := h.invalidator.ClearAll(ctx); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error limpiando caché distribuido",
			})
			return
		}
	} else {
		h.cache.Clear()
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Caché limpiado exitosamente",
		"distributed": h.invalidator != nil,
	})
}

// GetCacheStats devuelve estadísticas del caché
func (h *Handler) GetCacheStats(c *gin.Context) {
	stats := h.cache.Stats()
	stats["distributed"] = h.invalidator != nil

	if h.invalidator != nil {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()

		if err := h.invalidator.Health(ctx); err != nil {
			stats["redis_pubsub_status"] = "unhealthy"
			stats["redis_pubsub_error"] = err.Error()
		} else {
			stats["redis_pubsub_status"] = "healthy"
		}
	}

	c.JSON(http.StatusOK, stats)
}
