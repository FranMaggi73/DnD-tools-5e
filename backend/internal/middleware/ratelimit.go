// backend/internal/middleware/ratelimit.go
package middleware

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter interface para permitir diferentes implementaciones
type RateLimiter interface {
	Allow(ctx context.Context, key string) (bool, error)
	GetRemaining(ctx context.Context, key string) (int, error)
}

// RateLimitMiddleware crea un middleware de rate limiting
func RateLimitMiddleware(limiter RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			c.Next()
			return
		}

		ctx := c.Request.Context()

		// Verificar límite
		allowed, err := limiter.Allow(ctx, uid)
		if err != nil {
			// En caso de error con Redis, permitir la petición (fail-open)
			// pero loggear el error
			c.Error(err)
			c.Next()
			return
		}

		if !allowed {
			// Obtener cuándo podrá hacer otra petición
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "Demasiadas peticiones. Por favor, espera un momento antes de intentar de nuevo.",
				"retry_after": "60s",
			})
			c.Abort()
			return
		}

		// Agregar headers informativos
		if remaining, err := limiter.GetRemaining(ctx, uid); err == nil {
			c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		}

		c.Next()
	}
}

// ===========================
// IN-MEMORY FALLBACK LIMITER
// ===========================

type InMemoryLimiter struct {
	requests map[string][]time.Time
	mu       sync.RWMutex
	limit    int
	window   time.Duration
}

func NewInMemoryLimiter(limit int, window time.Duration) *InMemoryLimiter {
	rl := &InMemoryLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}

	// Cleanup cada minuto
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			rl.cleanup()
		}
	}()

	return rl
}

func (rl *InMemoryLimiter) Allow(ctx context.Context, key string) (bool, error) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	// Filtrar requests antiguos
	if times, exists := rl.requests[key]; exists {
		valid := []time.Time{}
		for _, t := range times {
			if t.After(windowStart) {
				valid = append(valid, t)
			}
		}
		rl.requests[key] = valid
	}

	// Verificar límite
	if len(rl.requests[key]) >= rl.limit {
		return false, nil
	}

	// Agregar request
	rl.requests[key] = append(rl.requests[key], now)
	return true, nil
}

func (rl *InMemoryLimiter) GetRemaining(ctx context.Context, key string) (int, error) {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	count := 0
	if times, exists := rl.requests[key]; exists {
		for _, t := range times {
			if t.After(windowStart) {
				count++
			}
		}
	}

	remaining := rl.limit - count
	if remaining < 0 {
		remaining = 0
	}

	return remaining, nil
}

func (rl *InMemoryLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	for key, times := range rl.requests {
		valid := []time.Time{}
		for _, t := range times {
			if t.After(windowStart) {
				valid = append(valid, t)
			}
		}
		if len(valid) == 0 {
			delete(rl.requests, key)
		} else {
			rl.requests[key] = valid
		}
	}
}
