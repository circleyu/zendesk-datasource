package cache

import (
	"sync"
	"time"

	"github.com/patrickmn/go-cache"
)

// Manager handles caching operations
type Manager struct {
	cache *cache.Cache
	mu    sync.RWMutex
}

// NewManager creates a new cache manager
func NewManager(defaultExpiration, cleanupInterval time.Duration) *Manager {
	return &Manager{
		cache: cache.New(defaultExpiration, cleanupInterval),
	}
}

// Get retrieves a value from cache
func (m *Manager) Get(key string) (interface{}, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.cache.Get(key)
}

// Set stores a value in cache
func (m *Manager) Set(key string, value interface{}, expiration time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.cache.Set(key, value, expiration)
}

// Delete removes a value from cache
func (m *Manager) Delete(key string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.cache.Delete(key)
}

// DeleteByPattern removes all keys matching a pattern
func (m *Manager) DeleteByPattern(pattern string) {
	// Note: go-cache doesn't support pattern matching directly
	// This is a simplified implementation
	m.mu.Lock()
	defer m.mu.Unlock()
	items := m.cache.Items()
	for key := range items {
		if containsPattern(key, pattern) {
			m.cache.Delete(key)
		}
	}
}

// Clear removes all items from cache
func (m *Manager) Clear() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.cache.Flush()
}

// GetStats returns cache statistics
func (m *Manager) GetStats() Stats {
	m.mu.RLock()
	defer m.mu.RUnlock()
	items := m.cache.Items()
	return Stats{
		Size:    len(items),
		MaxSize: 1000, // Default max size
	}
}

// Stats represents cache statistics
type Stats struct {
	Size    int
	MaxSize int
}

// containsPattern checks if a string contains a pattern (simplified)
func containsPattern(s, pattern string) bool {
	// Simple substring matching - can be enhanced with regex
	return len(pattern) > 0 && len(s) >= len(pattern) && s[:len(pattern)] == pattern
}

