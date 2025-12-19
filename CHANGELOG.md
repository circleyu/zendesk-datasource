# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-19

### Added
- **Backend Plugin Support**: Full Go backend plugin implementation with resource API endpoints
- **Caching System**: Server-side caching with LRU and TTL strategies for improved performance
- **Batch Operations**: Parallel batch query execution for multiple queries
- **Data Export**: CSV and JSON export functionality for tickets, users, and organizations
- **Advanced Visualizations**: 
  - Heatmap panel for ticket distribution
  - Gantt chart panel for ticket lifecycle visualization
  - Relationship graph panel for ticket relationships
- **Internationalization**: Support for English, Traditional Chinese, and Simplified Chinese
- **Query Templates**: Pre-built query templates for common use cases
- **Query History**: Local storage-based query history management
- **Request Batching**: Automatic request batching to reduce API calls
- **Health Check Endpoint**: Resource API endpoint for health monitoring

### Changed
- Enhanced query editor with support for users and organizations
- Improved data transformation with time series support
- Updated to Grafana SDK v11.0.0

### Fixed
- Fixed date handling in data transformations
- Improved error handling and user feedback

## [0.3.0] - 2025-12-19

### Added
- Go backend plugin implementation
- Server-side caching mechanism
- Resource API endpoints (export, batch-query, fields, health)
- Batch query execution
- Data export functionality
- Advanced visualization components

## [0.2.0] - 2025-12-19

### Added
- User query functionality
- Organization query functionality
- Query templates component
- Query history manager
- Cache manager (frontend)
- Request batcher utility

## [0.1.0] - 2025-12-19

### Added
- Initial MVP release
- Basic ticket query functionality
- Search functionality
- Ticket by ID query
- Statistics query
- Configuration editor
- Query editor
- Data transformation utilities

[1.0.0]: https://github.com/grafana/zendesk-datasource/releases/tag/v1.0.0
[0.3.0]: https://github.com/grafana/zendesk-datasource/releases/tag/v0.3.0
[0.2.0]: https://github.com/grafana/zendesk-datasource/releases/tag/v0.2.0
[0.1.0]: https://github.com/grafana/zendesk-datasource/releases/tag/v0.1.0

