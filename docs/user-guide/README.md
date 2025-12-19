# Zendesk Data Source Plugin - User Guide

## Overview

The Zendesk Data Source Plugin for Grafana allows you to connect Grafana dashboards to your Zendesk instance, enabling you to visualize ticket data, user information, and organizational metrics in real-time.

## Installation

### From Grafana Plugin Marketplace

1. Open Grafana and navigate to **Configuration** > **Plugins**
2. Search for "Zendesk"
3. Click **Install** on the Zendesk Data Source plugin
4. Follow the installation prompts

### Manual Installation

1. Download the plugin package from the [releases page](https://github.com/grafana/zendesk-datasource/releases)
2. Extract the package to your Grafana plugins directory:
   - Linux: `/var/lib/grafana/plugins/`
   - macOS: `/usr/local/var/lib/grafana/plugins/`
   - Windows: `C:\Program Files\GrafanaLabs\grafana\data\plugins\`
3. Restart Grafana

## Configuration

### Step 1: Add Data Source

1. Navigate to **Configuration** > **Data Sources**
2. Click **Add data source**
3. Select **Zendesk** from the list

### Step 2: Configure Connection

Fill in the following fields:

- **Subdomain**: Your Zendesk subdomain (e.g., `yourcompany` for `yourcompany.zendesk.com`)
- **Email**: Your Zendesk account email address
- **API Token**: Your Zendesk API token

#### How to Get Your API Token

1. Log in to your Zendesk account
2. Navigate to **Admin** > **Apps and integrations** > **APIs** > **Zendesk API**
3. Click **Add API token**
4. Give it a description and copy the token
5. **Important**: Save the token immediately - you won't be able to see it again!

### Step 3: Test Connection

Click **Test** to verify your connection. You should see a success message if everything is configured correctly.

### Step 4: Save

Click **Save & Test** to save your configuration.

## Creating Queries

### Query Types

The plugin supports several query types:

#### 1. Tickets
Query tickets with optional filters:
- **Status**: Filter by ticket status (New, Open, Pending, Hold, Solved, Closed)
- **Priority**: Filter by priority (Low, Normal, High, Urgent)
- **Limit**: Maximum number of tickets to return
- **Page**: Page number for pagination

#### 2. Search
Search tickets using Zendesk search syntax:
- **Search Query**: Use Zendesk search syntax (e.g., `status:open priority:high`)

#### 3. Ticket by ID
Get a specific ticket by its ID:
- **Ticket ID**: The numeric ID of the ticket

#### 4. Statistics
Get aggregated statistics about tickets:
- Shows total tickets, breakdown by status and priority

#### 5. Users
Query user information:
- **User ID** (optional): Filter by specific user ID
- Returns user list with roles and activity status

#### 6. Organizations
Query organization information:
- **Organization ID** (optional): Filter by specific organization ID
- Returns organization list with domain information

### Data Formats

You can choose between two data formats:

- **Table**: Returns data in tabular format
- **Time Series**: Returns data as time series for graphing

## Creating Visualizations

### Basic Table

1. Create a new panel
2. Select your Zendesk data source
3. Choose **Tickets** query type
4. Set format to **Table**
5. Configure your filters
6. Click **Run query**

### Time Series Graph

1. Create a new panel
2. Select your Zendesk data source
3. Choose **Tickets** query type
4. Set format to **Time Series**
5. Configure your filters
6. The panel will automatically display as a time series graph

### Using Query Templates

1. In the query editor, click **Load Template**
2. Select a pre-built template from the list
3. The query will be automatically configured
4. Adjust parameters as needed

## Advanced Features

### Query History

Your recent queries are automatically saved. You can:
- View query history
- Reuse previous queries
- Search through history

### Batch Queries

Use the resource API to execute multiple queries in parallel:
- Reduces API calls
- Improves performance
- Supports up to 10 queries per batch

### Data Export

Export query results in various formats:
- **CSV**: For spreadsheet applications
- **JSON**: For programmatic access

## Troubleshooting

### Connection Issues

If you're having trouble connecting:

1. **Verify Credentials**: Double-check your subdomain, email, and API token
2. **Check API Token**: Ensure your API token is active and has proper permissions
3. **Network Access**: Verify that your Grafana server can reach `*.zendesk.com`
4. **Check Logs**: Review Grafana logs for detailed error messages

### Query Issues

If queries are not returning data:

1. **Check Filters**: Verify your filter criteria are correct
2. **Verify Permissions**: Ensure your API token has access to the requested data
3. **Check Limits**: Large result sets may be paginated
4. **Review Error Messages**: Check the panel for specific error messages

### Performance Issues

If queries are slow:

1. **Use Caching**: The plugin automatically caches results
2. **Reduce Limit**: Lower the number of results returned
3. **Use Filters**: Apply filters to reduce the dataset size
4. **Check API Rate Limits**: Zendesk has rate limits that may affect performance

## Best Practices

1. **Use Query Templates**: Start with templates and customize as needed
2. **Apply Filters**: Use filters to reduce data volume and improve performance
3. **Cache Results**: The plugin caches results automatically - don't disable caching unless necessary
4. **Monitor Rate Limits**: Be aware of Zendesk API rate limits
5. **Use Time Series for Trends**: Use time series format for trend analysis
6. **Export for Analysis**: Export data for deeper analysis in external tools

## Support

For issues, questions, or contributions:

- **GitHub Issues**: [Report an issue](https://github.com/grafana/zendesk-datasource/issues)
- **Documentation**: [Full documentation](https://github.com/grafana/zendesk-datasource)
- **Community**: Join our community discussions

## License

This plugin is licensed under the MIT License.

