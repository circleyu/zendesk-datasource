import React, { useState, useCallback } from 'react';
import {
  DataSourcePluginOptionsEditorProps,
  updateDatasourcePluginJsonDataOption,
  updateDatasourcePluginSecureJsonDataOption,
} from '@grafana/data';
import { Button, Field, Input, SecretInput, Alert } from '@grafana/ui';
import { ZendeskConfig, ZendeskSecureJsonData } from './types';
import { ZendeskClient } from './utils/zendeskClient';

type Props = DataSourcePluginOptionsEditorProps<ZendeskConfig, ZendeskSecureJsonData>;

export const ConfigEditor: React.FC<Props> = ({ options, onOptionsChange }) => {
  const { jsonData, secureJsonData } = options;
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const onSubdomainChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateDatasourcePluginJsonDataOption({ options, onOptionsChange }, 'subdomain', event.target.value);
    },
    [options, onOptionsChange]
  );

  const onEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateDatasourcePluginJsonDataOption({ options, onOptionsChange }, 'email', event.target.value);
    },
    [options, onOptionsChange]
  );

  const onApiTokenChange = useCallback(
    (value: string) => {
      updateDatasourcePluginSecureJsonDataOption({ options, onOptionsChange }, 'apiToken', value);
    },
    [options, onOptionsChange]
  );

  const onResetApiToken = useCallback(() => {
    updateDatasourcePluginSecureJsonDataOption({ options, onOptionsChange }, 'apiToken', '');
  }, [options, onOptionsChange]);

  const onTestConnection = useCallback(async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const client = new ZendeskClient(jsonData, secureJsonData);
      const result = await client.testConnection();
      setTestResult({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setTesting(false);
    }
  }, [jsonData, secureJsonData]);

  return (
    <div className="gf-form-group">
      <div className="gf-form">
        <Field
          label="Zendesk Subdomain"
          description="Your Zendesk subdomain (e.g., 'mycompany' for mycompany.zendesk.com)"
          required
        >
          <Input
            value={jsonData.subdomain || ''}
            onChange={onSubdomainChange}
            placeholder="mycompany"
            width={40}
          />
        </Field>
      </div>

      <div className="gf-form">
        <Field
          label="Email"
          description="Your Zendesk account email"
          required
        >
          <Input
            value={jsonData.email || ''}
            onChange={onEmailChange}
            placeholder="user@example.com"
            width={40}
          />
        </Field>
      </div>

      <div className="gf-form">
        <Field
          label="API Token"
          description="Your Zendesk API token. You can generate one in Zendesk Admin > Apps and integrations > APIs > Zendesk API"
          required
        >
          <SecretInput
            value={secureJsonData?.apiToken || ''}
            isConfigured={!!secureJsonData?.apiToken && !options.secureJsonFields?.apiToken}
            onChange={onApiTokenChange}
            onReset={onResetApiToken}
            placeholder="Enter API token"
            width={40}
          />
        </Field>
      </div>

      <div className="gf-form">
        <Button
          onClick={onTestConnection}
          disabled={testing || !jsonData.subdomain || !jsonData.email || !secureJsonData?.apiToken}
          variant="primary"
        >
          {testing ? 'Testing...' : 'Save & Test'}
        </Button>
      </div>

      {testResult && (
        <div className="gf-form" style={{ marginTop: '16px' }}>
          {testResult.success ? (
            <Alert title="Success" severity="success">
              {testResult.message}
            </Alert>
          ) : (
            <Alert title="Error" severity="error">
              {testResult.message}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

