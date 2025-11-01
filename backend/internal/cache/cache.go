// backend/internal/cache/cache.go
package cache

import (
	"sync"
	"time"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// ===========================
// CACHE CON TIMESTAMPS
// ===========================

// CacheItem representa un elemento cacheado con metadata
type CacheItem struct {
	Data      interface{}
	ExpiresAt time.Time
	CachedAt  time.Time // ← NUEVO: para saber qué tan viejo es
}

// Cache es un caché thread-safe con TTL y timestamps
type Cache struct {
	items map[string]*CacheItem
	mutex sync.RWMutex
	ttl   time.Duration
}

// NewCache crea una nueva instancia de caché
func NewCache(ttl time.Duration) *Cache {
	cache := &Cache{
		items: make(map[string]*CacheItem),
		ttl:   ttl,
	}

	go cache.cleanupExpired()

	return cache
}

// Get obtiene un item del caché CON su timestamp
func (c *Cache) Get(key string) (interface{}, time.Time, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, time.Time{}, false
	}

	if time.Now().After(item.ExpiresAt) {
		return nil, time.Time{}, false
	}

	return item.Data, item.CachedAt, true
}

// Set guarda un item en el caché con TTL por defecto
func (c *Cache) Set(key string, data interface{}) {
	c.SetWithTTL(key, data, c.ttl)
}

// SetWithTTL guarda un item con un TTL personalizado
func (c *Cache) SetWithTTL(key string, data interface{}, ttl time.Duration) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	now := time.Now()
	c.items[key] = &CacheItem{
		Data:      data,
		ExpiresAt: now.Add(ttl),
		CachedAt:  now, // ← timestamp de creación
	}
}

// Delete elimina un item del caché
func (c *Cache) Delete(key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	delete(c.items, key)
}

// Clear limpia todo el caché
func (c *Cache) Clear() {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	c.items = make(map[string]*CacheItem)
}

// InvalidatePattern elimina todos los items que contienen un patrón
func (c *Cache) InvalidatePattern(pattern string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	keysToDelete := make([]string, 0)
	for key := range c.items {
		if containsPattern(key, pattern) {
			keysToDelete = append(keysToDelete, key)
		}
	}

	for _, key := range keysToDelete {
		delete(c.items, key)
	}
}

// InvalidateCampaignSafe invalida con locks apropiados
func (c *Cache) InvalidateCampaignSafe(campaignID string) {
	// ✅ FIX: Un solo lock para toda la operación
	c.mutex.Lock()
	defer c.mutex.Unlock()

	patterns := []string{
		"campaign:" + campaignID,
		"members:" + campaignID,
		"characters:" + campaignID,
	}

	// Recolectar keys a eliminar
	keysToDelete := make([]string, 0)
	for key := range c.items {
		for _, pattern := range patterns {
			if containsPattern(key, pattern) {
				keysToDelete = append(keysToDelete, key)
				break // No necesita verificar otros patterns
			}
		}
	}

	// Eliminar todas las keys encontradas
	for _, key := range keysToDelete {
		delete(c.items, key)
	}
}

// cleanupExpired elimina items expirados periódicamente
func (c *Cache) cleanupExpired() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.mutex.Lock()
		now := time.Now()
		for key, item := range c.items {
			if now.After(item.ExpiresAt) {
				delete(c.items, key)
			}
		}
		c.mutex.Unlock()
	}
}

// Stats devuelve estadísticas del caché CON info de timestamps
func (c *Cache) Stats() map[string]interface{} {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	totalItems := len(c.items)
	expiredItems := 0
	now := time.Now()

	var oldestItem, newestItem time.Time
	for _, item := range c.items {
		if now.After(item.ExpiresAt) {
			expiredItems++
		}

		if oldestItem.IsZero() || item.CachedAt.Before(oldestItem) {
			oldestItem = item.CachedAt
		}
		if newestItem.IsZero() || item.CachedAt.After(newestItem) {
			newestItem = item.CachedAt
		}
	}

	stats := map[string]interface{}{
		"total_items":   totalItems,
		"expired_items": expiredItems,
		"active_items":  totalItems - expiredItems,
	}

	if !oldestItem.IsZero() {
		stats["oldest_entry_age"] = now.Sub(oldestItem).String()
		stats["newest_entry_age"] = now.Sub(newestItem).String()
	}

	return stats
}

// containsPattern verifica si una clave contiene un patrón
func containsPattern(key, pattern string) bool {
	return len(key) >= len(pattern) && key[:len(pattern)] == pattern
}

// ===========================
// HELPERS CON TIMESTAMPS
// ===========================

// GetCampaign helper con timestamp
func (c *Cache) GetCampaign(campaignID string) (*models.Campaign, time.Time, bool) {
	data, cachedAt, found := c.Get("campaign:" + campaignID)
	if !found {
		return nil, time.Time{}, false
	}

	campaign, ok := data.(*models.Campaign)
	return campaign, cachedAt, ok
}

// SetCampaign helper con TTL ajustable
func (c *Cache) SetCampaign(campaign *models.Campaign) {
	// TTL más corto para datos que cambian frecuentemente
	c.SetWithTTL("campaign:"+campaign.ID, campaign, 10*time.Second)
}

// InvalidateCampaign elimina una campaña específica del caché
func (c *Cache) InvalidateCampaign(campaignID string) {
	c.Delete("campaign:" + campaignID)
	c.InvalidatePattern("members:" + campaignID)
	c.InvalidatePattern("characters:" + campaignID)
}

// GetMembers helper con timestamp
func (c *Cache) GetMembers(campaignID string) ([]models.CampaignMember, time.Time, bool) {
	data, cachedAt, found := c.Get("members:" + campaignID)
	if !found {
		return nil, time.Time{}, false
	}

	members, ok := data.([]models.CampaignMember)
	return members, cachedAt, ok
}

// SetMembers helper
func (c *Cache) SetMembers(campaignID string, members []models.CampaignMember) {
	c.SetWithTTL("members:"+campaignID, members, 30*time.Second)
}

// GetCharacters helper con timestamp
func (c *Cache) GetCharacters(campaignID string) ([]models.Character, time.Time, bool) {
	data, cachedAt, found := c.Get("characters:" + campaignID)
	if !found {
		return nil, time.Time{}, false
	}

	characters, ok := data.([]models.Character)
	return characters, cachedAt, ok
}

// SetCharacters helper
func (c *Cache) SetCharacters(campaignID string, characters []models.Character) {
	c.SetWithTTL("characters:"+campaignID, characters, 30*time.Second)
}

// GetEncounter helper (NO cachear encuentros activos, demasiado crítico)
func (c *Cache) GetEncounter(encounterID string) (*models.Encounter, time.Time, bool) {
	data, cachedAt, found := c.Get("encounter:" + encounterID)
	if !found {
		return nil, time.Time{}, false
	}

	encounter, ok := data.(*models.Encounter)
	return encounter, cachedAt, ok
}

// SetEncounter helper con TTL MUY corto (datos de combate cambian rápido)
func (c *Cache) SetEncounter(encounter *models.Encounter) {
	c.SetWithTTL("encounter:"+encounter.ID, encounter, 5*time.Second)
}

// InvalidateEncounter elimina un encuentro del caché
func (c *Cache) InvalidateEncounter(encounterID string) {
	c.Delete("encounter:" + encounterID)
	c.InvalidatePattern("combatants:" + encounterID)
}
