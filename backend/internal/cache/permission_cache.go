// backend/internal/cache/permissions_cache.go
package cache

import (
	"sync"
	"time"
)

// ===========================
// CACHÉ SIMPLIFICADO SOLO PARA PERMISOS
// ===========================

// PermissionCacheItem representa un item en el caché de permisos
type PermissionCacheItem struct {
	UserID    string
	Resource  string // "campaign:ID" o "encounter:ID"
	HasAccess bool
	Role      string // "dm", "player", "owner"
	ExpiresAt time.Time
}

// PermissionsCache es un caché especializado para permisos
type PermissionsCache struct {
	items map[string]*PermissionCacheItem
	mutex sync.RWMutex
	ttl   time.Duration
}

// NewPermissionsCache crea una nueva instancia
func NewPermissionsCache(ttl time.Duration) *PermissionsCache {
	cache := &PermissionsCache{
		items: make(map[string]*PermissionCacheItem),
		ttl:   ttl,
	}

	// Cleanup cada 5 minutos
	go cache.cleanupExpired()

	return cache
}

// generateKey genera una clave única para el caché
func (pc *PermissionsCache) generateKey(userID, resource string) string {
	return userID + ":" + resource
}

// CheckPermission verifica si un usuario tiene permiso (con caché)
func (pc *PermissionsCache) CheckPermission(userID, resource string) (*PermissionCacheItem, bool) {
	pc.mutex.RLock()
	defer pc.mutex.RUnlock()

	key := pc.generateKey(userID, resource)
	item, found := pc.items[key]

	if !found {
		return nil, false
	}

	// Verificar si expiró
	if time.Now().After(item.ExpiresAt) {
		return nil, false
	}

	return item, true
}

// SetPermission guarda un permiso en caché
func (pc *PermissionsCache) SetPermission(userID, resource string, hasAccess bool, role string) {
	pc.mutex.Lock()
	defer pc.mutex.Unlock()

	key := pc.generateKey(userID, resource)
	pc.items[key] = &PermissionCacheItem{
		UserID:    userID,
		Resource:  resource,
		HasAccess: hasAccess,
		Role:      role,
		ExpiresAt: time.Now().Add(pc.ttl),
	}
}

// InvalidateUser invalida todos los permisos de un usuario
func (pc *PermissionsCache) InvalidateUser(userID string) {
	pc.mutex.Lock()
	defer pc.mutex.Unlock()

	for key, item := range pc.items {
		if item.UserID == userID {
			delete(pc.items, key)
		}
	}
}

// InvalidateResource invalida todos los permisos de un recurso
func (pc *PermissionsCache) InvalidateResource(resource string) {
	pc.mutex.Lock()
	defer pc.mutex.Unlock()

	for key, item := range pc.items {
		if item.Resource == resource {
			delete(pc.items, key)
		}
	}
}

// Clear limpia todo el caché
func (pc *PermissionsCache) Clear() {
	pc.mutex.Lock()
	defer pc.mutex.Unlock()

	pc.items = make(map[string]*PermissionCacheItem)
}

// cleanupExpired elimina items expirados periódicamente
func (pc *PermissionsCache) cleanupExpired() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		pc.mutex.Lock()
		now := time.Now()
		for key, item := range pc.items {
			if now.After(item.ExpiresAt) {
				delete(pc.items, key)
			}
		}
		pc.mutex.Unlock()
	}
}

// Stats devuelve estadísticas del caché
func (pc *PermissionsCache) Stats() map[string]interface{} {
	pc.mutex.RLock()
	defer pc.mutex.RUnlock()

	totalItems := len(pc.items)
	expiredItems := 0
	now := time.Now()

	for _, item := range pc.items {
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
