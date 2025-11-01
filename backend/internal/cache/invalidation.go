// backend/internal/cache/invalidation.go
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// ===========================
// REDIS PUB/SUB INVALIDATION
// ===========================

type InvalidationMessage struct {
	Type      string    `json:"type"`    // "campaign", "encounter", "character", "pattern"
	ID        string    `json:"id"`      // ID del recurso
	Pattern   string    `json:"pattern"` // Para invalidaciones por patrón
	Timestamp time.Time `json:"timestamp"`
}

type CacheInvalidator struct {
	redisClient *redis.Client
	cache       *Cache
	pubsub      *redis.PubSub
	channel     string
}

// NewCacheInvalidator crea un nuevo invalidador con Redis Pub/Sub
func NewCacheInvalidator(redisURL string, cache *Cache) (*CacheInvalidator, error) {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("error parsing Redis URL: %w", err)
	}

	client := redis.NewClient(opt)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("error connecting to Redis: %w", err)
	}

	invalidator := &CacheInvalidator{
		redisClient: client,
		cache:       cache,
		channel:     "cache:invalidation",
	}

	// Suscribirse al canal de invalidación
	invalidator.pubsub = client.Subscribe(context.Background(), invalidator.channel)

	// Iniciar listener
	go invalidator.listen()

	log.Println("✅ Redis Pub/Sub cache invalidation inicializado")

	return invalidator, nil
}

// listen escucha mensajes de invalidación de otras instancias
func (ci *CacheInvalidator) listen() {
	ch := ci.pubsub.Channel()

	for msg := range ch {
		var invalidation InvalidationMessage
		if err := json.Unmarshal([]byte(msg.Payload), &invalidation); err != nil {
			log.Printf("Error parsing invalidation message: %v", err)
			continue
		}

		// Procesar invalidación
		ci.processInvalidation(invalidation)
	}
}

// processInvalidation procesa un mensaje de invalidación
func (ci *CacheInvalidator) processInvalidation(msg InvalidationMessage) {
	log.Printf("📡 Invalidación recibida: %s %s", msg.Type, msg.ID)

	switch msg.Type {
	case "campaign":
		ci.cache.InvalidateCampaign(msg.ID)
	case "encounter":
		ci.cache.InvalidateEncounter(msg.ID)
	case "pattern":
		ci.cache.InvalidatePattern(msg.Pattern)
	case "clear":
		ci.cache.Clear()
	}
}

// PublishInvalidation publica un mensaje de invalidación a todas las instancias
func (ci *CacheInvalidator) PublishInvalidation(ctx context.Context, msgType, id, pattern string) error {
	msg := InvalidationMessage{
		Type:      msgType,
		ID:        id,
		Pattern:   pattern,
		Timestamp: time.Now(),
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("error marshaling invalidation: %w", err)
	}

	if err := ci.redisClient.Publish(ctx, ci.channel, data).Err(); err != nil {
		return fmt.Errorf("error publishing invalidation: %w", err)
	}

	log.Printf("📤 Invalidación publicada: %s %s", msgType, id)
	return nil
}

// InvalidateCampaign invalida una campaña en todas las instancias
func (ci *CacheInvalidator) InvalidateCampaign(ctx context.Context, campaignID string) error {
	// Invalidar localmente primero
	ci.cache.InvalidateCampaign(campaignID)

	// Publicar a otras instancias
	return ci.PublishInvalidation(ctx, "campaign", campaignID, "")
}

// InvalidateEncounter invalida un encuentro en todas las instancias
func (ci *CacheInvalidator) InvalidateEncounter(ctx context.Context, encounterID string) error {
	// Invalidar localmente primero
	ci.cache.InvalidateEncounter(encounterID)

	// Publicar a otras instancias
	return ci.PublishInvalidation(ctx, "encounter", encounterID, "")
}

// InvalidatePattern invalida por patrón en todas las instancias
func (ci *CacheInvalidator) InvalidatePattern(ctx context.Context, pattern string) error {
	// Invalidar localmente primero
	ci.cache.InvalidatePattern(pattern)

	// Publicar a otras instancias
	return ci.PublishInvalidation(ctx, "pattern", "", pattern)
}

// ClearAll limpia toda la caché en todas las instancias
func (ci *CacheInvalidator) ClearAll(ctx context.Context) error {
	// Limpiar localmente primero
	ci.cache.Clear()

	// Publicar a otras instancias
	return ci.PublishInvalidation(ctx, "clear", "", "")
}

// Close cierra la conexión de Redis
func (ci *CacheInvalidator) Close() error {
	if ci.pubsub != nil {
		if err := ci.pubsub.Close(); err != nil {
			return err
		}
	}

	if ci.redisClient != nil {
		return ci.redisClient.Close()
	}

	return nil
}

// Health verifica el estado de la conexión
func (ci *CacheInvalidator) Health(ctx context.Context) error {
	return ci.redisClient.Ping(ctx).Err()
}
