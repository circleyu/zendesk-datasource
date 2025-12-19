package plugin

import (
	"context"
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// HealthStatus represents the health status of the plugin
type HealthStatus struct {
	Status      string                 `json:"status"`
	Message     string                 `json:"message"`
	Timestamp   time.Time              `json:"timestamp"`
	CacheStats  map[string]interface{} `json:"cache_stats,omitempty"`
	APILatency  time.Duration          `json:"api_latency,omitempty"`
}

// CheckHealth performs a comprehensive health check
func (ds *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	status := &HealthStatus{
		Timestamp: time.Now(),
	}

	// Test Zendesk API connection
	start := time.Now()
	if err := ds.zendeskClient.TestConnection(); err != nil {
		status.Status = "error"
		status.Message = fmt.Sprintf("Zendesk API connection failed: %v", err)
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: status.Message,
		}, nil
	}
	status.APILatency = time.Since(start)

	// Check cache status
	if ds.cacheManager != nil {
		cacheStats := ds.cacheManager.GetStats()
		status.CacheStats = map[string]interface{}{
			"size":     cacheStats.Size,
			"max_size": cacheStats.MaxSize,
		}
	}

	status.Status = "ok"
	status.Message = "All systems operational"

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: status.Message,
		JSONDetails: func() []byte {
			cacheSize := 0
			if ds.cacheManager != nil {
				cacheSize = ds.cacheManager.GetStats().Size
			}
			return []byte(fmt.Sprintf(`{
			"cache_size": %d,
			"api_latency_ms": %.2f
		}`, cacheSize, float64(status.APILatency.Nanoseconds())/1e6))
		}(),
	}, nil
}

