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

// ✅ NUEVO: TTLs optimizados por tipo de dato
const (
	CampaignTTL    = 5 * time.Minute
	MembersTTL     = 3 * time.Minute
	CharactersTTL  = 2 * time.Minute
	EncounterTTL   = 5 * time.Minute
	CombatantsTTL  = 5 * time.Minute
	InventoryTTL   = 1 * time.Minute
	UserTTL        = 10 * time.Minute
	PermissionsTTL = 5 * time.Minute
)

// CacheItem representa un elemento cacheado con metadata
type CacheItem struct {
	Data      interface{}
	ExpiresAt time.Time
	CachedAt  time.Time
	Hits      int64
}

// ✅ NUEVO: CacheStats con más información
type CacheStats struct {
	TotalItems   int                       `json:"total_items"`
	ExpiredItems int                       `json:"expired_items"`
	ActiveItems  int                       `json:"active_items"`
	OldestEntry  string                    `json:"oldest_entry_age,omitempty"`
	NewestEntry  string                    `json:"newest_entry_age,omitempty"`
	TotalHits    int64                     `json:"total_hits"`
	HitRate      float64                   `json:"hit_rate,omitempty"`
	ByType       map[string]CacheTypeStats `json:"by_type"`
}

type CacheTypeStats struct {
	Count int   `json:"count"`
	Hits  int64 `json:"hits"`
}

// Cache es un caché thread-safe con TTL y timestamps
type Cache struct {
	items map[string]*CacheItem
	mutex sync.RWMutex
	ttl   time.Duration
	// ✅ NUEVO: Contadores para estadísticas
	totalHits   int64
	totalMisses int64
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
	item, found := c.items[key]
	c.mutex.RUnlock()

	if !found {
		// ✅ Incrementar misses
		c.mutex.Lock()
		c.totalMisses++
		c.mutex.Unlock()
		return nil, time.Time{}, false
	}

	if time.Now().After(item.ExpiresAt) {
		c.mutex.Lock()
		c.totalMisses++
		c.mutex.Unlock()
		return nil, time.Time{}, false
	}

	// ✅ Incrementar hits
	c.mutex.Lock()
	item.Hits++
	c.totalHits++
	c.mutex.Unlock()

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
		Hits:      0,
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

// ✅ MEJORADO: Stats con más información
func (c *Cache) Stats() CacheStats {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	totalItems := len(c.items)
	expiredItems := 0
	now := time.Now()

	var oldestItem, newestItem time.Time
	var totalHits int64

	byType := make(map[string]CacheTypeStats)

	for key, item := range c.items {
		if now.After(item.ExpiresAt) {
			expiredItems++
			continue
		}

		totalHits += item.Hits

		if oldestItem.IsZero() || item.CachedAt.Before(oldestItem) {
			oldestItem = item.CachedAt
		}
		if newestItem.IsZero() || item.CachedAt.After(newestItem) {
			newestItem = item.CachedAt
		}

		// ✅ Clasificar por tipo
		typePrefix := getTypePrefix(key)
		stats := byType[typePrefix]
		stats.Count++
		stats.Hits += item.Hits
		byType[typePrefix] = stats
	}

	stats := CacheStats{
		TotalItems:   totalItems,
		ExpiredItems: expiredItems,
		ActiveItems:  totalItems - expiredItems,
		TotalHits:    c.totalHits,
		ByType:       byType,
	}

	if !oldestItem.IsZero() {
		stats.OldestEntry = now.Sub(oldestItem).String()
		stats.NewestEntry = now.Sub(newestItem).String()
	}

	totalRequests := c.totalHits + c.totalMisses
	if totalRequests > 0 {
		stats.HitRate = float64(c.totalHits) / float64(totalRequests) * 100
	}

	return stats
}

// ✅ NUEVO: Helper para clasificar tipos de cache
func getTypePrefix(key string) string {
	if len(key) < 8 {
		return "other"
	}

	prefix := key[:8]
	switch prefix {
	case "campaign":
		return "campaigns"
	case "members:":
		return "members"
	case "characte":
		return "characters"
	case "encounte":
		return "encounters"
	case "combatan":
		return "combatants"
	case "inventor":
		return "inventory"
	default:
		return "other"
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
	c.SetWithTTL("campaign:"+campaign.ID, campaign, CampaignTTL)
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
	c.SetWithTTL("members:"+campaignID, members, MembersTTL)
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
	c.SetWithTTL("characters:"+campaignID, characters, CharactersTTL)
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
	c.SetWithTTL("encounter:"+encounter.ID, encounter, EncounterTTL)
}

// InvalidateEncounter elimina un encuentro del caché
func (c *Cache) InvalidateEncounter(encounterID string) {
	c.Delete("encounter:" + encounterID)
	c.InvalidatePattern("combatants:" + encounterID)
}

// Al final del archivo, agregar helpers para inventario

// GetInventory helper con timestamp
func (c *Cache) GetInventory(characterID string) (interface{}, time.Time, bool) {
	data, cachedAt, found := c.Get("inventory:" + characterID)
	if !found {
		return nil, time.Time{}, false
	}
	return data, cachedAt, true
}

// SetInventory helper (TTL: 15 segundos - cambia frecuentemente)
func (c *Cache) SetInventory(characterID string, inventory interface{}) {
	c.SetWithTTL("inventory:"+characterID, inventory, InventoryTTL)
}

// InvalidateInventory elimina inventario del cache
func (c *Cache) InvalidateInventory(characterID string) {
	c.Delete("inventory:" + characterID)
}
