package plugin

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewDatasource(t *testing.T) {
	settings := backend.DataSourceInstanceSettings{
		JSONData: json.RawMessage(`{"subdomain":"test","email":"test@example.com"}`),
		DecryptedSecureJSONData: map[string]string{
			"apiToken": "test-token",
		},
	}

	ds, err := NewDatasource(context.Background(), settings)
	require.NoError(t, err)
	assert.NotNil(t, ds)
}

func TestNewDatasource_MissingSubdomain(t *testing.T) {
	settings := backend.DataSourceInstanceSettings{
		JSONData: json.RawMessage(`{"email":"test@example.com"}`),
		DecryptedSecureJSONData: map[string]string{
			"apiToken": "test-token",
		},
	}

	_, err := NewDatasource(context.Background(), settings)
	assert.Error(t, err)
}

func TestNewDatasource_MissingToken(t *testing.T) {
	settings := backend.DataSourceInstanceSettings{
		JSONData: json.RawMessage(`{"subdomain":"test","email":"test@example.com"}`),
		DecryptedSecureJSONData: map[string]string{},
	}

	_, err := NewDatasource(context.Background(), settings)
	assert.Error(t, err)
}

