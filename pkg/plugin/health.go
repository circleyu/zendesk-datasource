package plugin

import (
	"context"
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/circleyu/zendesk-datasource/pkg/cache"
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
	cacheStats := ds.cacheManager.GetStats()
	status.CacheStats = map[string]interface{}{
		"size":     cacheStats.Size,
		"max_size": cacheStats.MaxSize,
	}

	status.Status = "ok"
	status.Message = "All systems operational"

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: status.Message,
		JSONDetails: []byte(`{
			"cache_size": ` + fmt.Sprintf("%d", cacheStats.Size) + `,
			"api_latency_ms": ` + fmt.Sprintf("%.2f", float64(status.APILatency.Nanoseconds())/1e6) + `
		}`),
	}, nil
}

