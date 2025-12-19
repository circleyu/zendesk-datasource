package plugin

import (
	"context"
	"sync"

	"github.com/circleyu/zendesk-datasource/pkg/zendesk"
)

// BatchQueryRequest represents a batch query request
type BatchQueryRequest struct {
	Queries []QueryRequest `json:"queries"`
}

// QueryRequest represents a single query in a batch
type QueryRequest struct {
	QueryType string            `json:"queryType"`
	Params    map[string]string `json:"params"`
}

// BatchQueryResponse represents the response from batch query
type BatchQueryResponse struct {
	Results []interface{} `json:"results"`
	Errors  []string      `json:"errors,omitempty"`
}

// ExecuteBatchQuery executes multiple queries in parallel
func (ds *Datasource) ExecuteBatchQuery(ctx context.Context, req *BatchQueryRequest) (*BatchQueryResponse, error) {
	var wg sync.WaitGroup
	results := make([]interface{}, len(req.Queries))
	errors := make([]string, len(req.Queries))
	resultMutex := &sync.Mutex{}

	for i, query := range req.Queries {
		wg.Add(1)
		go func(index int, q QueryRequest) {
			defer wg.Done()

			var result interface{}
			var err error

			switch q.QueryType {
			case "tickets":
				result, err = ds.zendeskClient.GetTickets(q.Params)
			case "users":
				result, err = ds.zendeskClient.GetUsers(q.Params)
			case "organizations":
				result, err = ds.zendeskClient.GetOrganizations(q.Params)
			default:
				err = fmt.Errorf("unknown query type: %s", q.QueryType)
			}

			resultMutex.Lock()
			if err != nil {
				errors[index] = err.Error()
			} else {
				results[index] = result
			}
			resultMutex.Unlock()
		}(i, query)
	}

	wg.Wait()

	// Filter out nil results
	filteredResults := make([]interface{}, 0)
	for _, r := range results {
		if r != nil {
			filteredResults = append(filteredResults, r)
		}
	}

	// Filter out empty errors
	filteredErrors := make([]string, 0)
	for _, e := range errors {
		if e != "" {
			filteredErrors = append(filteredErrors, e)
		}
	}

	return &BatchQueryResponse{
		Results: filteredResults,
		Errors:  filteredErrors,
	}, nil
}

