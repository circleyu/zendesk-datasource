package zendesk

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client represents a Zendesk API client
type Client struct {
	baseURL    string
	email      string
	apiToken   string
	httpClient *http.Client
}

// NewClient creates a new Zendesk API client
func NewClient(subdomain, email, apiToken string) *Client {
	return &Client{
		baseURL:  fmt.Sprintf("https://%s.zendesk.com/api/v2", subdomain),
		email:    email,
		apiToken: apiToken,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// getAuthHeader returns the Authorization header value
func (c *Client) getAuthHeader() string {
	credentials := fmt.Sprintf("%s/token:%s", c.email, c.apiToken)
	encoded := base64.StdEncoding.EncodeToString([]byte(credentials))
	return fmt.Sprintf("Basic %s", encoded)
}

// request performs an HTTP request to the Zendesk API
func (c *Client) request(method, endpoint string, body io.Reader) (*http.Response, error) {
	url := fmt.Sprintf("%s%s", c.baseURL, endpoint)
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", c.getAuthHeader())
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}

	if resp.StatusCode >= 400 {
		defer resp.Body.Close()
		var errorResp ErrorResponse
		if err := json.NewDecoder(resp.Body).Decode(&errorResp); err == nil {
			return nil, fmt.Errorf("API error: %s", errorResp.Error)
		}
		return nil, fmt.Errorf("HTTP error: %d %s", resp.StatusCode, http.StatusText(resp.StatusCode))
	}

	return resp, nil
}

// GetTickets retrieves tickets from Zendesk
func (c *Client) GetTickets(params map[string]string) (*TicketsResponse, error) {
	endpoint := "/tickets.json"
	if len(params) > 0 {
		query := ""
		for k, v := range params {
			if query != "" {
				query += "&"
			}
			query += fmt.Sprintf("%s=%s", k, v)
		}
		endpoint += "?" + query
	}

	resp, err := c.request("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result TicketsResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &result, nil
}

// GetUsers retrieves users from Zendesk
func (c *Client) GetUsers(params map[string]string) (*UsersResponse, error) {
	endpoint := "/users.json"
	if len(params) > 0 {
		query := ""
		for k, v := range params {
			if query != "" {
				query += "&"
			}
			query += fmt.Sprintf("%s=%s", k, v)
		}
		endpoint += "?" + query
	}

	resp, err := c.request("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result UsersResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &result, nil
}

// GetOrganizations retrieves organizations from Zendesk
func (c *Client) GetOrganizations(params map[string]string) (*OrganizationsResponse, error) {
	endpoint := "/organizations.json"
	if len(params) > 0 {
		query := ""
		for k, v := range params {
			if query != "" {
				query += "&"
			}
			query += fmt.Sprintf("%s=%s", k, v)
		}
		endpoint += "?" + query
	}

	resp, err := c.request("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result OrganizationsResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &result, nil
}

// TestConnection tests the connection to Zendesk API
func (c *Client) TestConnection() error {
	resp, err := c.request("GET", "/users/me.json", nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

