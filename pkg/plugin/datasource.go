package plugin

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"

	"github.com/circleyu/zendesk-datasource/pkg/cache"
	"github.com/circleyu/zendesk-datasource/pkg/zendesk"
)

// Datasource represents the Zendesk datasource
type Datasource struct {
	zendeskClient *zendesk.Client
	cacheManager  *cache.Manager
	config        *Config
}

// NewDatasource creates a new datasource instance
func NewDatasource(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	var config Config
	if err := json.Unmarshal(settings.JSONData, &config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	var secureConfig SecureConfig
	if settings.DecryptedSecureJSONData != nil {
		if apiToken, ok := settings.DecryptedSecureJSONData["apiToken"]; ok {
			secureConfig.APIToken = apiToken
		}
	}

	if config.Subdomain == "" || secureConfig.APIToken == "" {
		return nil, fmt.Errorf("subdomain and API token are required")
	}

	client := zendesk.NewClient(config.Subdomain, config.Email, secureConfig.APIToken)
	cacheMgr := cache.NewManager(cache.DefaultConfig().DefaultTTL, cache.DefaultConfig().CleanupInterval)

	return &Datasource{
		zendeskClient: client,
		cacheManager:  cacheMgr,
		config:        &config,
	}, nil
}

// QueryData handles data queries
func (ds *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		res := ds.handleQuery(ctx, q)
		response.Responses[q.RefID] = res
	}

	return response, nil
}

// handleQuery processes a single query
func (ds *Datasource) handleQuery(ctx context.Context, query backend.DataQuery) backend.DataQueryResponse {
	var queryModel map[string]interface{}
	if err := json.Unmarshal(query.JSON, &queryModel); err != nil {
		return backend.ErrDataQueryResponse(backend.StatusBadRequest, fmt.Sprintf("failed to unmarshal query: %v", err))
	}

	queryType, ok := queryModel["queryType"].(string)
	if !ok {
		return backend.ErrDataQueryResponse(backend.StatusBadRequest, "queryType is required")
	}

	switch queryType {
	case "tickets":
		return ds.queryTickets(ctx, query, queryModel)
	case "users":
		return ds.queryUsers(ctx, query, queryModel)
	case "organizations":
		return ds.queryOrganizations(ctx, query, queryModel)
	default:
		return backend.ErrDataQueryResponse(backend.StatusBadRequest, fmt.Sprintf("unknown query type: %s", queryType))
	}
}

// queryTickets handles ticket queries
func (ds *Datasource) queryTickets(ctx context.Context, query backend.DataQuery, queryModel map[string]interface{}) backend.DataQueryResponse {
	params := make(map[string]string)
	if status, ok := queryModel["status"].(string); ok && status != "" {
		params["status"] = status
	}
	if priority, ok := queryModel["priority"].(string); ok && priority != "" {
		params["priority"] = priority
	}

	// Check cache first
	cacheKey := fmt.Sprintf("tickets:%v", params)
	if cached, found := ds.cacheManager.Get(cacheKey); found {
		if tickets, ok := cached.(*zendesk.TicketsResponse); ok {
			return ds.ticketsToDataFrame(tickets)
		}
	}

	// Fetch from API
	tickets, err := ds.zendeskClient.GetTickets(params)
	if err != nil {
		return backend.ErrDataQueryResponse(backend.StatusInternal, fmt.Sprintf("failed to fetch tickets: %v", err))
	}

	// Cache the result
	ds.cacheManager.Set(cacheKey, tickets, cache.DefaultConfig().DefaultTTL)

	return ds.ticketsToDataFrame(tickets)
}

// queryUsers handles user queries
func (ds *Datasource) queryUsers(ctx context.Context, query backend.DataQuery, queryModel map[string]interface{}) backend.DataQueryResponse {
	params := make(map[string]string)

	// Check cache first
	cacheKey := fmt.Sprintf("users:%v", params)
	if cached, found := ds.cacheManager.Get(cacheKey); found {
		if users, ok := cached.(*zendesk.UsersResponse); ok {
			return ds.usersToDataFrame(users)
		}
	}

	// Fetch from API
	users, err := ds.zendeskClient.GetUsers(params)
	if err != nil {
		return backend.ErrDataQueryResponse(backend.StatusInternal, fmt.Sprintf("failed to fetch users: %v", err))
	}

	// Cache the result
	ds.cacheManager.Set(cacheKey, users, cache.DefaultConfig().DefaultTTL)

	return ds.usersToDataFrame(users)
}

// queryOrganizations handles organization queries
func (ds *Datasource) queryOrganizations(ctx context.Context, query backend.DataQuery, queryModel map[string]interface{}) backend.DataQueryResponse {
	params := make(map[string]string)

	// Check cache first
	cacheKey := fmt.Sprintf("organizations:%v", params)
	if cached, found := ds.cacheManager.Get(cacheKey); found {
		if orgs, ok := cached.(*zendesk.OrganizationsResponse); ok {
			return ds.organizationsToDataFrame(orgs)
		}
	}

	// Fetch from API
	orgs, err := ds.zendeskClient.GetOrganizations(params)
	if err != nil {
		return backend.ErrDataQueryResponse(backend.StatusInternal, fmt.Sprintf("failed to fetch organizations: %v", err))
	}

	// Cache the result
	ds.cacheManager.Set(cacheKey, orgs, cache.DefaultConfig().DefaultTTL)

	return ds.organizationsToDataFrame(orgs)
}

// ticketsToDataFrame converts tickets to Grafana DataFrame
func (ds *Datasource) ticketsToDataFrame(tickets *zendesk.TicketsResponse) backend.DataQueryResponse {
	frame := data.NewFrame("tickets")
	frame.Fields = append(frame.Fields,
		data.NewField("id", nil, []int64{}),
		data.NewField("subject", nil, []string{}),
		data.NewField("status", nil, []string{}),
		data.NewField("priority", nil, []string{}),
		data.NewField("created_at", nil, []string{}),
	)

	for _, ticket := range tickets.Tickets {
		subject := ""
		if ticket.Subject != nil {
			subject = *ticket.Subject
		}
		priority := ""
		if ticket.Priority != nil {
			priority = *ticket.Priority
		}

		frame.AppendRow(
			ticket.ID,
			subject,
			ticket.Status,
			priority,
			ticket.CreatedAt,
		)
	}

	return backend.DataQueryResponse{
		Frames: data.Frames{frame},
	}
}

// usersToDataFrame converts users to Grafana DataFrame
func (ds *Datasource) usersToDataFrame(users *zendesk.UsersResponse) backend.DataQueryResponse {
	frame := data.NewFrame("users")
	frame.Fields = append(frame.Fields,
		data.NewField("id", nil, []int64{}),
		data.NewField("name", nil, []string{}),
		data.NewField("email", nil, []string{}),
		data.NewField("role", nil, []string{}),
		data.NewField("active", nil, []bool{}),
	)

	for _, user := range users.Users {
		frame.AppendRow(
			user.ID,
			user.Name,
			user.Email,
			user.Role,
			user.Active,
		)
	}

	return backend.DataQueryResponse{
		Frames: data.Frames{frame},
	}
}

// organizationsToDataFrame converts organizations to Grafana DataFrame
func (ds *Datasource) organizationsToDataFrame(orgs *zendesk.OrganizationsResponse) backend.DataQueryResponse {
	frame := data.NewFrame("organizations")
	frame.Fields = append(frame.Fields,
		data.NewField("id", nil, []int64{}),
		data.NewField("name", nil, []string{}),
		data.NewField("domain_names", nil, []string{}),
		data.NewField("created_at", nil, []string{}),
	)

	for _, org := range orgs.Organizations {
		domains := ""
		if len(org.DomainNames) > 0 {
			domains = org.DomainNames[0] // Simplified
		}
		frame.AppendRow(
			org.ID,
			org.Name,
			domains,
			org.CreatedAt,
		)
	}

	return backend.DataQueryResponse{
		Frames: data.Frames{frame},
	}
}

// CallResource handles resource API calls
func (ds *Datasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	path := req.Path

	switch path {
	case "export":
		return ds.handleExport(ctx, req, sender)
	case "batch-query":
		return ds.handleBatchQuery(ctx, req, sender)
	case "fields":
		return ds.handleFields(ctx, req, sender)
	case "health":
		return ds.handleHealth(ctx, req, sender)
	default:
		return sender.Send(&backend.CallResourceResponse{
			Status: 404,
			Body:   []byte(fmt.Sprintf(`{"error":"Unknown resource path: %s"}`, path)),
		})
	}
}

// handleExport handles data export requests
func (ds *Datasource) handleExport(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	format := req.URL.Query().Get("format")
	if format == "" {
		format = "csv"
	}

	var queryParams map[string]interface{}
	if err := json.Unmarshal(req.Body, &queryParams); err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: 400,
			Body:   []byte(fmt.Sprintf(`{"error":"Invalid request body: %v"}`, err)),
		})
	}

	queryType, ok := queryParams["queryType"].(string)
	if !ok {
		return sender.Send(&backend.CallResourceResponse{
			Status: 400,
			Body:   []byte(`{"error":"queryType is required"}`),
		})
	}

	params := make(map[string]string)
	var data []byte
	var contentType string
	var err error

	switch queryType {
	case "tickets":
		tickets, err := ds.zendeskClient.GetTickets(params)
		if err != nil {
			return sender.Send(&backend.CallResourceResponse{
				Status: 500,
				Body:   []byte(fmt.Sprintf(`{"error":"Failed to fetch tickets: %v"}`, err)),
			})
		}
		data, contentType, err = ds.ExportTickets(tickets, ExportFormat(format))
	case "users":
		users, err := ds.zendeskClient.GetUsers(params)
		if err != nil {
			return sender.Send(&backend.CallResourceResponse{
				Status: 500,
				Body:   []byte(fmt.Sprintf(`{"error":"Failed to fetch users: %v"}`, err)),
			})
		}
		data, contentType, err = ds.ExportUsers(users, ExportFormat(format))
	default:
		return sender.Send(&backend.CallResourceResponse{
			Status: 400,
			Body:   []byte(fmt.Sprintf(`{"error":"Unsupported query type: %s"}`, queryType)),
		})
	}

	if err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: 500,
			Body:   []byte(fmt.Sprintf(`{"error":"Export failed: %v"}`, err)),
		})
	}

	return sender.Send(&backend.CallResourceResponse{
		Status: 200,
		Headers: map[string][]string{"Content-Type": {contentType}},
		Body:    data,
	})
}

// handleBatchQuery handles batch query requests
func (ds *Datasource) handleBatchQuery(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	var batchReq BatchQueryRequest
	if err := json.Unmarshal(req.Body, &batchReq); err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: 400,
			Body:   []byte(fmt.Sprintf(`{"error":"Invalid request body: %v"}`, err)),
		})
	}

	batchResp, err := ds.ExecuteBatchQuery(ctx, &batchReq)
	if err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: 500,
			Body:   []byte(fmt.Sprintf(`{"error":"Batch query failed: %v"}`, err)),
		})
	}

	response, err := json.Marshal(batchResp)
	if err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: 500,
			Body:   []byte(fmt.Sprintf(`{"error":"Failed to marshal response: %v"}`, err)),
		})
	}

	return sender.Send(&backend.CallResourceResponse{
		Status: 200,
		Headers: map[string][]string{"Content-Type": {"application/json"}},
		Body:    response,
	})
}

// handleFields returns available fields
func (ds *Datasource) handleFields(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	fields := map[string][]string{
		"tickets":      {"id", "subject", "status", "priority", "created_at", "updated_at"},
		"users":        {"id", "name", "email", "role", "active", "created_at"},
		"organizations": {"id", "name", "domain_names", "created_at"},
	}

	response, err := json.Marshal(fields)
	if err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: 500,
			Body:   []byte(fmt.Sprintf(`{"error":"Failed to marshal response: %v"}`, err)),
		})
	}

	return sender.Send(&backend.CallResourceResponse{
		Status: 200,
		Headers: map[string][]string{"Content-Type": {"application/json"}},
		Body:    response,
	})
}

// handleHealth handles health check requests
func (ds *Datasource) handleHealth(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	if err := ds.zendeskClient.TestConnection(); err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: 503,
			Body:   []byte(fmt.Sprintf(`{"status":"error","message":"%v"}`, err)),
		})
	}

	return sender.Send(&backend.CallResourceResponse{
		Status: 200,
		Headers: map[string][]string{"Content-Type": {"application/json"}},
		Body:    []byte(`{"status":"ok","message":"Connection successful"}`),
	})
}

