# Zendesk Data Source Plugin - Troubleshooting Guide

## Common Issues and Solutions

### Connection Issues

#### "Connection failed" Error

**Symptoms**: Unable to connect to Zendesk API

**Possible Causes**:
1. Incorrect subdomain
2. Invalid API token
3. Network connectivity issues
4. Zendesk API rate limiting

**Solutions**:
1. **Verify Subdomain**:
   - Check that your subdomain is correct (without `.zendesk.com`)
   - Example: If your URL is `yourcompany.zendesk.com`, use `yourcompany`

2. **Verify API Token**:
   - Ensure the API token is correct and active
   - Generate a new token if needed
   - Check token permissions in Zendesk

3. **Check Network**:
   - Verify Grafana server can reach `*.zendesk.com`
   - Check firewall rules
   - Test with `curl` or `wget`

4. **Rate Limiting**:
   - Wait a few minutes and try again
   - Check your Zendesk plan's rate limits
   - Reduce query frequency

#### "Authentication failed" Error

**Symptoms**: 401 or 403 errors

**Solutions**:
1. Verify email and API token are correct
2. Ensure API token has not expired
3. Check Zendesk account status
4. Verify API access is enabled in Zendesk settings

### Query Issues

#### No Data Returned

**Symptoms**: Query executes but returns no results

**Possible Causes**:
1. Filters too restrictive
2. No data matching criteria
3. Permission issues
4. Pagination issues

**Solutions**:
1. **Check Filters**:
   - Remove filters one by one to isolate the issue
   - Verify filter values are correct
   - Check for typos in filter values

2. **Verify Data Exists**:
   - Check Zendesk directly for matching data
   - Verify date ranges if using time filters

3. **Check Permissions**:
   - Ensure API token has access to requested data
   - Verify user permissions in Zendesk

4. **Pagination**:
   - Try different page numbers
   - Increase limit (if applicable)
   - Check total count in response

#### Slow Query Performance

**Symptoms**: Queries take a long time to execute

**Solutions**:
1. **Use Filters**:
   - Apply specific filters to reduce dataset size
   - Use date ranges to limit time period

2. **Reduce Limit**:
   - Lower the number of results returned
   - Use pagination for large datasets

3. **Check Cache**:
   - Verify caching is enabled
   - Check cache hit rate in health endpoint

4. **Optimize Queries**:
   - Use specific query types instead of search when possible
   - Avoid overly complex search queries

#### "Invalid query" Error

**Symptoms**: Query fails with validation error

**Solutions**:
1. **Check Query Type**:
   - Ensure query type is selected
   - Verify query type is supported

2. **Validate Parameters**:
   - Check all required parameters are provided
   - Verify parameter types are correct
   - Review parameter values for invalid characters

3. **Review Query Syntax**:
   - For search queries, verify Zendesk search syntax
   - Check for special characters that need escaping

### Data Display Issues

#### Incorrect Data Format

**Symptoms**: Data appears in wrong format or missing fields

**Solutions**:
1. **Check Format Setting**:
   - Verify format is set correctly (Table vs Time Series)
   - Switch format and re-run query

2. **Verify Fields**:
   - Check available fields using `/resources/fields` endpoint
   - Ensure requested fields exist in data

3. **Data Transformation**:
   - Check data transformation logic
   - Verify time field formatting

#### Time Series Not Displaying

**Symptoms**: Time series queries don't show graphs

**Solutions**:
1. **Check Time Field**:
   - Verify time field exists in data
   - Ensure time field is properly formatted

2. **Check Panel Type**:
   - Use appropriate panel type (Graph, Time Series)
   - Verify panel is configured for time series data

3. **Data Range**:
   - Check time range in Grafana
   - Verify data falls within selected time range

### Performance Issues

#### High Memory Usage

**Symptoms**: Plugin uses excessive memory

**Solutions**:
1. **Reduce Cache Size**:
   - Lower cache maximum size
   - Reduce cache TTL

2. **Limit Query Results**:
   - Use smaller limits
   - Implement pagination

3. **Optimize Queries**:
   - Use more specific queries
   - Avoid loading unnecessary data

#### High CPU Usage

**Symptoms**: Plugin uses excessive CPU

**Solutions**:
1. **Reduce Query Frequency**:
   - Increase refresh intervals
   - Use caching effectively

2. **Optimize Data Processing**:
   - Reduce data transformation complexity
   - Use efficient algorithms

3. **Check for Loops**:
   - Review code for infinite loops
   - Add proper error handling

### Cache Issues

#### Stale Data

**Symptoms**: Data appears outdated

**Solutions**:
1. **Clear Cache**:
   - Restart Grafana to clear cache
   - Reduce cache TTL

2. **Check Cache Settings**:
   - Verify cache TTL is appropriate
   - Consider cache invalidation strategy

#### Cache Not Working

**Symptoms**: Cache doesn't seem to improve performance

**Solutions**:
1. **Verify Cache is Enabled**:
   - Check cache configuration
   - Review cache statistics in health endpoint

2. **Check Cache Hit Rate**:
   - Monitor cache hit/miss ratio
   - Adjust cache strategy if needed

## Debugging Tips

### Enable Debug Logging

1. **Grafana Logging**:
   - Set log level to `debug` in Grafana config
   - Review Grafana logs for detailed information

2. **Browser Console**:
   - Open browser developer tools
   - Check console for errors
   - Review network requests

### Test API Directly

Test Zendesk API directly to isolate issues:

```bash
# Test connection
curl -u email@example.com/token:API_TOKEN \
  https://yourcompany.zendesk.com/api/v2/users/me.json

# Test tickets endpoint
curl -u email@example.com/token:API_TOKEN \
  https://yourcompany.zendesk.com/api/v2/tickets.json
```

### Check Health Endpoint

Use the health endpoint to diagnose issues:

```bash
curl http://localhost:3000/api/datasources/1/resources/health
```

Response includes:
- Connection status
- Cache statistics
- API latency

## Getting Help

If you're still experiencing issues:

1. **Check Logs**:
   - Review Grafana logs
   - Check browser console
   - Review network requests

2. **Gather Information**:
   - Grafana version
   - Plugin version
   - Error messages
   - Steps to reproduce

3. **Report Issue**:
   - Create GitHub issue with details
   - Include logs and error messages
   - Provide steps to reproduce

## Prevention

### Best Practices

1. **Regular Testing**:
   - Test connections regularly
   - Monitor query performance
   - Review error logs

2. **Proper Configuration**:
   - Use secure API tokens
   - Rotate tokens regularly
   - Follow security best practices

3. **Monitoring**:
   - Set up alerts for errors
   - Monitor API rate limits
   - Track performance metrics

4. **Documentation**:
   - Keep configuration documented
   - Note any customizations
   - Document troubleshooting steps

