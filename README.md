# Grafana Zendesk Datasource Plugin

Grafana datasource plugin for querying and visualizing data from Zendesk.

## Features

- **Ticket Queries**: Query tickets by status, priority, assignee, and more
- **Search**: Full-text search across Zendesk tickets
- **Statistics**: Get ticket statistics and metrics
- **Time Series**: Visualize ticket trends over time
- **Table View**: Display tickets in a table format

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

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/circleyu/zendesk-datasource).

## Changelog

### 0.1.0 (Initial Release)
- Basic ticket querying
- Search functionality
- Statistics
- Time series visualization
- Table view

