# Grafana Zendesk Data Source Plugin

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/grafana/zendesk-datasource)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A Grafana data source plugin for integrating Zendesk ticket data, user information, and organizational metrics into your Grafana dashboards.

## Features

- ✅ **Multiple Query Types**: Tickets, Users, Organizations, Statistics
- ✅ **Advanced Filtering**: Status, Priority, Date ranges, Custom filters
- ✅ **Time Series Support**: Convert data to time series for trend analysis
- ✅ **Query Templates**: Pre-built templates for common use cases
- ✅ **Query History**: Save and reuse previous queries
- ✅ **Backend Plugin**: Go-based backend for improved performance
- ✅ **Caching**: Server-side caching with LRU and TTL strategies
- ✅ **Batch Operations**: Execute multiple queries in parallel
- ✅ **Data Export**: Export data in CSV and JSON formats
- ✅ **Advanced Visualizations**: Heatmap, Gantt chart, Relationship graph
- ✅ **Internationalization**: Support for English, Traditional Chinese, Simplified Chinese
- ✅ **Health Monitoring**: Built-in health check endpoint

## Installation

### From Source

1. Clone this repository:
```bash
git clone https://github.com/circleyu/zendesk-datasource.git
cd zendesk-datasource
```

2. Install dependencies:
```bash
npm install
```

3. Build the plugin:
```bash
npm run build
```

4. Copy the `dist` directory to your Grafana plugins directory:
```bash
cp -r dist /var/lib/grafana/plugins/grafana-zendesk-datasource
```

5. Restart Grafana

### Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The plugin will be available at `http://localhost:3000`

## Configuration

1. Go to **Configuration > Data Sources** in Grafana
2. Click **Add data source**
3. Select **Zendesk**
4. Configure the following settings:
   - **Zendesk Subdomain**: Your Zendesk subdomain (e.g., `mycompany` for `mycompany.zendesk.com`)
   - **Email**: Your Zendesk account email
   - **API Token**: Your Zendesk API token
5. Click **Save & Test** to verify the connection

### Getting Your API Token

1. Log in to your Zendesk account
2. Go to **Admin > Apps and integrations > APIs > Zendesk API**
3. Click **Add API token**
4. Copy the generated token

## Usage

### Query Types

#### Tickets
Query tickets with filters:
- Status (new, open, pending, hold, solved, closed)
- Priority (low, normal, high, urgent)
- Assignee ID
- Requester ID

#### Search
Full-text search using Zendesk search syntax:
```
status:open priority:high
```

#### Ticket by ID
Get a specific ticket by its ID.

#### Stats
Get statistics about tickets:
- Total count
- Count by status
- Count by priority
- Average resolution time

### Query Options

- **Limit**: Number of results to return (default: 25)
- **Format**: 
  - **Table**: Display as table
  - **Time Series**: Display as time series chart

### Example Queries

**Get all open tickets:**
- Query Type: Tickets
- Status: Open
- Format: Table

**Get ticket trends:**
- Query Type: Tickets
- Format: Time Series

**Search for high priority tickets:**
- Query Type: Search
- Search Query: `priority:high`
- Format: Table

## Development

### Project Structure

```
zendesk-datasource/
├── src/
│   ├── module.ts                 # Plugin entry point
│   ├── DataSource.ts             # Data source class
│   ├── ConfigEditor.tsx          # Configuration editor
│   ├── QueryEditor.tsx           # Query editor
│   ├── types.ts                  # TypeScript types
│   └── utils/
│       ├── zendeskClient.ts     # Zendesk API client
│       └── dataTransform.ts     # Data transformation utilities
├── plugin.json                   # Plugin configuration
└── package.json                  # Dependencies
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## Requirements

- Grafana >= 11.0.0
- Node.js >= 18.0.0
- A Zendesk account with API access

## License

MIT License - see [LICENSE](LICENSE) file for details

## Documentation

- [User Guide](docs/user-guide/README.md) - Complete user documentation
- [API Documentation](docs/api/README.md) - Backend API reference
- [Developer Guide](docs/developer-guide/README.md) - Development setup and guidelines
- [Troubleshooting](docs/troubleshooting/README.md) - Common issues and solutions

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/circleyu/zendesk-datasource).

