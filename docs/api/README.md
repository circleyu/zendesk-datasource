# Zendesk Data Source Plugin - API Documentation

## Overview

The Zendesk Data Source Plugin provides a backend API for advanced operations including data export, batch queries, and health monitoring.

## Base URL

All API endpoints are relative to:
```
/api/datasources/:id/resources/
```

Where `:id` is your data source ID.

## Authentication

All API requests use Grafana's built-in authentication. No additional authentication is required.

## Endpoints

### Export Data

Export query results in various formats.

**Endpoint**: `GET /api/datasources/:id/resources/export`

**Query Parameters**:
- `format` (string, optional): Export format. Options: `csv`, `json`. Default: `csv`

**Request Body**:
```json
{
  "queryType": "tickets",
  "params": {
    "status": "open",
    "priority": "high"
  }
}
```

**Response**:
- **Content-Type**: `text/csv` or `application/json`
- **Body**: Exported data in the requested format

**Example**:
```bash
curl -X GET "http://localhost:3000/api/datasources/1/resources/export?format=csv" \
  -H "Content-Type: application/json" \
  -d '{"queryType": "tickets", "params": {"status": "open"}}'
```

### Batch Query

Execute multiple queries in parallel.

**Endpoint**: `POST /api/datasources/:id/resources/batch-query`

**Request Body**:
```json
{
  "queries": [
    {
      "queryType": "tickets",
      "params": {
        "status": "open"
      }
    },
    {
      "queryType": "users",
      "params": {}
    }
  ]
}
```

**Response**:
```json
{
  "results": [
    {
      "tickets": [...],
      "count": 10
    },
    {
      "users": [...],
      "count": 5
    }
  ],
  "errors": []
}
```

**Example**:
```bash
curl -X POST "http://localhost:3000/api/datasources/1/resources/batch-query" \
  -H "Content-Type: application/json" \
  -d '{
    "queries": [
      {"queryType": "tickets", "params": {"status": "open"}},
      {"queryType": "users", "params": {}}
    ]
  }'
```

### Get Available Fields

Get a list of available fields for each query type.

**Endpoint**: `GET /api/datasources/:id/resources/fields`

**Response**:
```json
{
  "tickets": ["id", "subject", "status", "priority", "created_at", "updated_at"],
  "users": ["id", "name", "email", "role", "active", "created_at"],
  "organizations": ["id", "name", "domain_names", "created_at"]
}
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/datasources/1/resources/fields"
```

### Health Check

Check the health status of the data source.

**Endpoint**: `GET /api/datasources/:id/resources/health`

**Response**:
```json
{
  "status": "ok",
  "message": "Connection successful",
  "cache_size": 5,
  "api_latency_ms": 123.45
}
```

**Status Codes**:
- `200`: Healthy
- `503`: Unhealthy (connection failed)

**Example**:
```bash
curl -X GET "http://localhost:3000/api/datasources/1/resources/health"
```

## Query Types

### Tickets

Query parameters:
- `status` (string, optional): Filter by status (new, open, pending, hold, solved, closed)
- `priority` (string, optional): Filter by priority (low, normal, high, urgent)
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Results per page (default: 25, max: 100)

### Users

Query parameters:
- `role` (string, optional): Filter by role (end-user, agent, admin)
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Results per page (default: 25, max: 100)

### Organizations

Query parameters:
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Results per page (default: 25, max: 100)

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

**Common Error Codes**:
- `400`: Bad Request - Invalid parameters
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error
- `503`: Service Unavailable - Connection failed

## Rate Limiting

The plugin respects Zendesk API rate limits:
- Standard: 700 requests per minute
- Enterprise: 2000 requests per minute

The plugin automatically handles rate limiting and will retry requests when appropriate.

## Caching

Query results are automatically cached:
- **Default TTL**: 5 minutes
- **Cache Strategy**: LRU (Least Recently Used)
- **Max Size**: 1000 entries

Cache can be invalidated by:
- Manual invalidation via API (future feature)
- Automatic expiration based on TTL
- Data updates (future feature)

## Examples

### Complete Workflow

```bash
# 1. Check health
curl -X GET "http://localhost:3000/api/datasources/1/resources/health"

# 2. Get available fields
curl -X GET "http://localhost:3000/api/datasources/1/resources/fields"

# 3. Export tickets as CSV
curl -X GET "http://localhost:3000/api/datasources/1/resources/export?format=csv" \
  -H "Content-Type: application/json" \
  -d '{"queryType": "tickets", "params": {"status": "open"}}'

# 4. Execute batch query
curl -X POST "http://localhost:3000/api/datasources/1/resources/batch-query" \
  -H "Content-Type: application/json" \
  -d '{
    "queries": [
      {"queryType": "tickets", "params": {"status": "open"}},
      {"queryType": "users", "params": {}}
    ]
  }'
```

## Support

For API issues or questions:
- **GitHub Issues**: [Report an issue](https://github.com/grafana/zendesk-datasource/issues)
- **Documentation**: [Full documentation](https://github.com/grafana/zendesk-datasource)

