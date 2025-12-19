import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './DataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { ZendeskConfig, ZendeskQuery, ZendeskSecureJsonData } from './types';

export const plugin = new DataSourcePlugin<DataSource, ZendeskQuery, ZendeskConfig, ZendeskSecureJsonData>(
  DataSource
)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);

