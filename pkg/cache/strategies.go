package cache

import "time"

// Strategy defines cache eviction strategy
type Strategy string

const (
	// StrategyTTL uses time-based expiration
	StrategyTTL Strategy = "ttl"
	// StrategyLRU uses least recently used eviction
	StrategyLRU Strategy = "lru"
	// StrategyAdaptive adjusts based on data update frequency
	StrategyAdaptive Strategy = "adaptive"
)

// Config holds cache configuration
type Config struct {
	Strategy      Strategy
	DefaultTTL    time.Duration
	MaxSize       int
	CleanupInterval time.Duration
	KeyPrefix     string
}

// DefaultConfig returns default cache configuration
func DefaultConfig() *Config {
	return &Config{
		Strategy:        StrategyTTL,
		DefaultTTL:     5 * time.Minute,
		MaxSize:         1000,
		CleanupInterval: 10 * time.Minute,
		KeyPrefix:       "zendesk:",
	}
}

