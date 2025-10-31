// backend/internal/ratelimit/redis_limiter.go
package ratelimit

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisLimiter struct {
	client *redis.Client
	limit  int
	window time.Duration
}

// NewRedisLimiter crea un rate limiter basado en Redis
func NewRedisLimiter(redisURL string, limit int, window time.Duration) (*RedisLimiter, error) {
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

	return &RedisLimiter{
		client: client,
		limit:  limit,
		window: window,
	}, nil
}

// Allow verifica si una petición está permitida usando sliding window
func (rl *RedisLimiter) Allow(ctx context.Context, key string) (bool, error) {
	now := time.Now()
	windowStart := now.Add(-rl.window)

	pipe := rl.client.Pipeline()

	// 1. Remover entradas antiguas
	zremCmd := pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart.UnixNano()))

	// 2. Contar requests en la ventana
	zcountCmd := pipe.ZCount(ctx, key, fmt.Sprintf("%d", windowStart.UnixNano()), "+inf")

	if _, err := pipe.Exec(ctx); err != nil {
		return false, fmt.Errorf("error executing pipeline: %w", err)
	}

	if _, err := zremCmd.Result(); err != nil {
		return false, fmt.Errorf("error removing old entries: %w", err)
	}

	count, err := zcountCmd.Result()
	if err != nil {
		return false, fmt.Errorf("error counting requests: %w", err)
	}

	if count >= int64(rl.limit) {
		return false, nil
	}

	if err := rl.client.ZAdd(ctx, key, redis.Z{
		Score:  float64(now.UnixNano()),
		Member: fmt.Sprintf("%d", now.UnixNano()),
	}).Err(); err != nil {
		return false, fmt.Errorf("error adding request: %w", err)
	}

	rl.client.Expire(ctx, key, rl.window*2)

	return true, nil
}

// GetRemaining devuelve cuántas peticiones quedan disponibles
func (rl *RedisLimiter) GetRemaining(ctx context.Context, key string) (int, error) {
	windowStart := time.Now().Add(-rl.window)

	count, err := rl.client.ZCount(ctx, key, fmt.Sprintf("%d", windowStart.UnixNano()), "+inf").Result()
	if err != nil {
		return 0, fmt.Errorf("error counting requests: %w", err)
	}

	remaining := rl.limit - int(count)
	if remaining < 0 {
		remaining = 0
	}

	return remaining, nil
}

// Close cierra la conexión Redis
func (rl *RedisLimiter) Close() error {
	return rl.client.Close()
}

// Reset limpia el rate limit de una key
func (rl *RedisLimiter) Reset(ctx context.Context, key string) error {
	return rl.client.Del(ctx, key).Err()
}
