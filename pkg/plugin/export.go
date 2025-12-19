package plugin

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/circleyu/zendesk-datasource/pkg/zendesk"
)

// ExportFormat represents the export format
type ExportFormat string

const (
	ExportFormatCSV  ExportFormat = "csv"
	ExportFormatJSON ExportFormat = "json"
	ExportFormatExcel ExportFormat = "excel" // Note: Excel export would require additional library
)

// ExportTickets exports tickets to the specified format
func (ds *Datasource) ExportTickets(tickets *zendesk.TicketsResponse, format ExportFormat) ([]byte, string, error) {
	switch format {
	case ExportFormatJSON:
		data, err := json.MarshalIndent(tickets, "", "  ")
		return data, "application/json", err
	case ExportFormatCSV:
		return ds.ticketsToCSV(tickets), "text/csv", nil
	default:
		return nil, "", fmt.Errorf("unsupported format: %s", format)
	}
}

// ExportUsers exports users to the specified format
func (ds *Datasource) ExportUsers(users *zendesk.UsersResponse, format ExportFormat) ([]byte, string, error) {
	switch format {
	case ExportFormatJSON:
		data, err := json.MarshalIndent(users, "", "  ")
		return data, "application/json", err
	case ExportFormatCSV:
		return ds.usersToCSV(users), "text/csv", nil
	default:
		return nil, "", fmt.Errorf("unsupported format: %s", format)
	}
}

// ExportOrganizations exports organizations to the specified format
func (ds *Datasource) ExportOrganizations(orgs *zendesk.OrganizationsResponse, format ExportFormat) ([]byte, string, error) {
	switch format {
	case ExportFormatJSON:
		data, err := json.MarshalIndent(orgs, "", "  ")
		return data, "application/json", err
	case ExportFormatCSV:
		return ds.organizationsToCSV(orgs), "text/csv", nil
	default:
		return nil, "", fmt.Errorf("unsupported format: %s", format)
	}
}

// ticketsToCSV converts tickets to CSV format
func (ds *Datasource) ticketsToCSV(tickets *zendesk.TicketsResponse) []byte {
	var b strings.Builder
	writer := csv.NewWriter(&b)

	// Write header
	writer.Write([]string{"ID", "Subject", "Status", "Priority", "Created At", "Updated At", "Requester ID", "Assignee ID"})

	// Write data
	for _, ticket := range tickets.Tickets {
		subject := ""
		if ticket.Subject != nil {
			subject = *ticket.Subject
		}
		priority := ""
		if ticket.Priority != nil {
			priority = *ticket.Priority
		}
		assigneeID := ""
		if ticket.AssigneeID != nil {
			assigneeID = fmt.Sprintf("%d", *ticket.AssigneeID)
		}

		writer.Write([]string{
			fmt.Sprintf("%d", ticket.ID),
			subject,
			ticket.Status,
			priority,
			ticket.CreatedAt,
			ticket.UpdatedAt,
			fmt.Sprintf("%d", ticket.RequesterID),
			assigneeID,
		})
	}

	writer.Flush()
	return []byte(b.String())
}

// usersToCSV converts users to CSV format
func (ds *Datasource) usersToCSV(users *zendesk.UsersResponse) []byte {
	var b strings.Builder
	writer := csv.NewWriter(&b)

	// Write header
	writer.Write([]string{"ID", "Name", "Email", "Role", "Active", "Created At", "Updated At"})

	// Write data
	for _, user := range users.Users {
		writer.Write([]string{
			fmt.Sprintf("%d", user.ID),
			user.Name,
			user.Email,
			user.Role,
			fmt.Sprintf("%t", user.Active),
			user.CreatedAt,
			user.UpdatedAt,
		})
	}

	writer.Flush()
	return []byte(b.String())
}

// organizationsToCSV converts organizations to CSV format
func (ds *Datasource) organizationsToCSV(orgs *zendesk.OrganizationsResponse) []byte {
	var b strings.Builder
	writer := csv.NewWriter(&b)

	// Write header
	writer.Write([]string{"ID", "Name", "Domain Names", "Created At", "Updated At"})

	// Write data
	for _, org := range orgs.Organizations {
		domains := strings.Join(org.DomainNames, "; ")
		writer.Write([]string{
			fmt.Sprintf("%d", org.ID),
			org.Name,
			domains,
			org.CreatedAt,
			org.UpdatedAt,
		})
	}

	writer.Flush()
	return []byte(b.String())
}

