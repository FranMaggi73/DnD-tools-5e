// backend/internal/cache/cache.go
package cache

import (
	"sync"
	"time"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// CacheItem representa un elemento cacheado con su tiempo de expiración
type CacheItem struct {
	Data      interface{}
	ExpiresAt time.Time
}

// Cache es un caché thread-safe con TTL
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

	// Goroutine para limpiar items expirados cada minuto
	go cache.cleanupExpired()

	return cache
}

// Get obtiene un item del caché
func (c *Cache) Get(key string) (interface{}, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, false
	}

	// Verificar si expiró
	if time.Now().After(item.ExpiresAt) {
		return nil, false
	}

	return item.Data, true
}

// Set guarda un item en el caché con TTL por defecto
func (c *Cache) Set(key string, data interface{}) {
	c.SetWithTTL(key, data, c.ttl)
}

// SetWithTTL guarda un item con un TTL personalizado
func (c *Cache) SetWithTTL(key string, data interface{}, ttl time.Duration) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	c.items[key] = &CacheItem{
		Data:      data,
		ExpiresAt: time.Now().Add(ttl),
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

	// ✅ Crear lista de keys a eliminar primero
	keysToDelete := make([]string, 0)
	for key := range c.items {
		if containsPattern(key, pattern) {
			keysToDelete = append(keysToDelete, key)
		}
	}

	// ✅ Eliminar después de soltar el lock de lectura
	for _, key := range keysToDelete {
		delete(c.items, key)
	}
}

// InvalidateCampaignSafe invalida con locks apropiados
func (c *Cache) InvalidateCampaignSafe(campaignID string) {
	c.mutex.Lock()
	keysToDelete := make([]string, 0)

	// Buscar todas las keys relacionadas
	patterns := []string{
		"campaign:" + campaignID,
		"members:" + campaignID,
		"characters:" + campaignID,
	}

	for key := range c.items {
		for _, pattern := range patterns {
			if containsPattern(key, pattern) {
				keysToDelete = append(keysToDelete, key)
				break
			}
		}
	}
	c.mutex.Unlock()

	// Eliminar con locks individuales
	c.mutex.Lock()
	for _, key := range keysToDelete {
		delete(c.items, key)
	}
	c.mutex.Unlock()
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

// Stats devuelve estadísticas del caché
func (c *Cache) Stats() map[string]interface{} {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	totalItems := len(c.items)
	expiredItems := 0
	now := time.Now()

	for _, item := range c.items {
		if now.After(item.ExpiresAt) {
			expiredItems++
		}
	}

	return map[string]interface{}{
		"total_items":   totalItems,
		"expired_items": expiredItems,
		"active_items":  totalItems - expiredItems,
	}
}

// containsPattern verifica si una clave contiene un patrón
func containsPattern(key, pattern string) bool {
	return len(key) >= len(pattern) && key[:len(pattern)] == pattern
}

// ===========================
// HELPERS PARA TIPOS ESPECÍFICOS
// ===========================

// GetCampaign helper para obtener Campaign del caché
func (c *Cache) GetCampaign(campaignID string) (*models.Campaign, bool) {
	data, found := c.Get("campaign:" + campaignID)
	if !found {
		return nil, false
	}

	campaign, ok := data.(*models.Campaign)
	return campaign, ok
}

// SetCampaign helper para guardar Campaign en el caché
func (c *Cache) SetCampaign(campaign *models.Campaign) {
	c.Set("campaign:"+campaign.ID, campaign)
}

// InvalidateCampaign elimina una campaña específica del caché
func (c *Cache) InvalidateCampaign(campaignID string) {
	c.Delete("campaign:" + campaignID)
	// También invalida datos relacionados
	c.InvalidatePattern("members:" + campaignID)
	c.InvalidatePattern("characters:" + campaignID)
}

// GetMembers helper para obtener miembros del caché
func (c *Cache) GetMembers(campaignID string) ([]models.CampaignMember, bool) {
	data, found := c.Get("members:" + campaignID)
	if !found {
		return nil, false
	}

	members, ok := data.([]models.CampaignMember)
	return members, ok
}

// SetMembers helper para guardar miembros en el caché
func (c *Cache) SetMembers(campaignID string, members []models.CampaignMember) {
	c.Set("members:"+campaignID, members)
}

// GetCharacters helper para obtener personajes del caché
func (c *Cache) GetCharacters(campaignID string) ([]models.Character, bool) {
	data, found := c.Get("characters:" + campaignID)
	if !found {
		return nil, false
	}

	characters, ok := data.([]models.Character)
	return characters, ok
}

// SetCharacters helper para guardar personajes en el caché
func (c *Cache) SetCharacters(campaignID string, characters []models.Character) {
	c.Set("characters:"+campaignID, characters)
}

// GetEncounter helper para obtener encuentro del caché
func (c *Cache) GetEncounter(encounterID string) (*models.Encounter, bool) {
	data, found := c.Get("encounter:" + encounterID)
	if !found {
		return nil, false
	}

	encounter, ok := data.(*models.Encounter)
	return encounter, ok
}

// SetEncounter helper para guardar encuentro en el caché
func (c *Cache) SetEncounter(encounter *models.Encounter) {
	c.Set("encounter:"+encounter.ID, encounter)
}

// InvalidateEncounter elimina un encuentro del caché
func (c *Cache) InvalidateEncounter(encounterID string) {
	c.Delete("encounter:" + encounterID)
	c.InvalidatePattern("combatants:" + encounterID)
}
