package zendesk

// Ticket represents a Zendesk ticket
type Ticket struct {
	ID          int64   `json:"id"`
	URL         string  `json:"url"`
	ExternalID  *string `json:"external_id,omitempty"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
	Type        *string `json:"type,omitempty"`
	Subject     *string `json:"subject,omitempty"`
	Description *string `json:"description,omitempty"`
	Priority    *string `json:"priority,omitempty"`
	Status      string  `json:"status"`
	RequesterID int64   `json:"requester_id"`
	AssigneeID  *int64  `json:"assignee_id,omitempty"`
	Tags        []string `json:"tags,omitempty"`
}

// User represents a Zendesk user
type User struct {
	ID        int64   `json:"id"`
	URL       string  `json:"url"`
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
	Role      string  `json:"role"`
	Active    bool    `json:"active"`
}

// Organization represents a Zendesk organization
type Organization struct {
	ID          int64    `json:"id"`
	URL         string   `json:"url"`
	Name        string   `json:"name"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
	DomainNames []string `json:"domain_names,omitempty"`
}

// TicketsResponse represents the response from tickets API
type TicketsResponse struct {
	Tickets      []Ticket `json:"tickets"`
	Count        *int     `json:"count,omitempty"`
	NextPage     *string  `json:"next_page,omitempty"`
	PreviousPage *string  `json:"previous_page,omitempty"`
}

// UsersResponse represents the response from users API
type UsersResponse struct {
	Users        []User   `json:"users"`
	Count        *int     `json:"count,omitempty"`
	NextPage     *string  `json:"next_page,omitempty"`
	PreviousPage *string  `json:"previous_page,omitempty"`
}

// OrganizationsResponse represents the response from organizations API
type OrganizationsResponse struct {
	Organizations []Organization `json:"organizations"`
	Count         *int           `json:"count,omitempty"`
	NextPage      *string        `json:"next_page,omitempty"`
	PreviousPage  *string        `json:"previous_page,omitempty"`
}

// ErrorResponse represents an error response from Zendesk API
type ErrorResponse struct {
	Error       string  `json:"error"`
	Description *string `json:"description,omitempty"`
}

