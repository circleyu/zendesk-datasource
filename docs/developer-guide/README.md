# Zendesk Data Source Plugin - Developer Guide

## Project Structure

```
zendesk-datasource/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── utils/              # Utility functions
│   ├── locales/            # Internationalization files
│   ├── i18n/               # i18n configuration
│   ├── ConfigEditor.tsx     # Configuration editor
│   ├── QueryEditor.tsx     # Query editor
│   ├── DataSource.ts       # Frontend data source
│   ├── module.ts           # Plugin entry point
│   └── types.ts            # TypeScript type definitions
├── pkg/                    # Backend source code (Go)
│   ├── plugin/             # Plugin implementation
│   ├── zendesk/            # Zendesk API client
│   └── cache/              # Caching implementation
├── docs/                   # Documentation
├── main.go                 # Backend entry point
├── go.mod                  # Go dependencies
├── package.json            # Node.js dependencies
├── plugin.json             # Plugin metadata
└── tsconfig.json           # TypeScript configuration
```

## Development Environment Setup

### Prerequisites

- **Node.js**: >= 18.x
- **Go**: >= 1.21
- **Grafana**: >= 11.0.0
- **Git**: Latest version

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/grafana/zendesk-datasource.git
   cd zendesk-datasource
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install Go dependencies**:
   ```bash
   go mod download
   ```

4. **Set up Grafana**:
   - Install Grafana locally or use Docker
   - Configure Grafana to load plugins from the development directory

### Development Workflow

#### Frontend Development

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Watch mode** (auto-rebuild on changes):
   ```bash
   npm run watch
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

#### Backend Development

1. **Build backend**:
   ```bash
   go build -o dist/gpx_zendesk-datasource_darwin_amd64 main.go
   ```

2. **Run tests**:
   ```bash
   go test ./...
   ```

3. **Run with coverage**:
   ```bash
   go test -cover ./...
   ```

## Code Style

### TypeScript/React

- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Prefer named exports
- Use ESLint and Prettier for formatting

### Go

- Follow [Effective Go](https://go.dev/doc/effective_go) guidelines
- Use `gofmt` for formatting
- Write tests for all exported functions
- Document all public APIs

## Testing

### Frontend Tests

Tests are located in `src/__tests__/`:

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Backend Tests

Tests are located alongside source files with `_test.go` suffix:

```bash
# Run all tests
go test ./...

# Run specific package
go test ./pkg/plugin

# Run with verbose output
go test -v ./...
```

## Building

### Frontend Build

```bash
npm run build
```

Output: `dist/` directory

### Backend Build

Build for different platforms:

```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o dist/gpx_zendesk-datasource_linux_amd64 main.go

# macOS
GOOS=darwin GOARCH=amd64 go build -o dist/gpx_zendesk-datasource_darwin_amd64 main.go

# Windows
GOOS=windows GOARCH=amd64 go build -o dist/gpx_zendesk-datasource_windows_amd64.exe main.go
```

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Ensure all tests pass
6. Update documentation
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Code Review Guidelines

- All code must be reviewed before merging
- Tests must pass
- Documentation must be updated
- Follow the existing code style

## Release Process

1. **Update version numbers**:
   - `package.json`
   - `plugin.json`
   - `CHANGELOG.md`

2. **Create release tag**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Build release artifacts**:
   ```bash
   npm run build
   # Build backend for all platforms
   ```

4. **Create GitHub release**:
   - Upload artifacts
   - Add release notes from CHANGELOG

## Troubleshooting

### Common Issues

**Build fails**:
- Check Node.js and Go versions
- Clear `node_modules` and reinstall
- Check `go.mod` for dependency issues

**Tests fail**:
- Ensure test environment is set up correctly
- Check for missing dependencies
- Review test output for specific errors

**Plugin not loading**:
- Check Grafana logs
- Verify plugin.json is correct
- Ensure all dependencies are installed

## Resources

- [Grafana Plugin SDK Documentation](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [React Documentation](https://react.dev/)
- [Go Documentation](https://go.dev/doc/)
- [Zendesk API Documentation](https://developer.zendesk.com/api-reference)

## License

This project is licensed under the MIT License.

