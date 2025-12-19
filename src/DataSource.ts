import {
  DataSourceApi,
  DataSourceInstanceSettings,
  DataQueryRequest,
  DataQueryResponse,
  DataSourcePluginMeta,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ZendeskConfig,
  ZendeskSecureJsonData,
  ZendeskQuery,
  QueryType,
  TicketStatus,
  TicketPriority,
} from './types';
import { ZendeskClient } from './utils/zendeskClient';
import {
  transformAPIResponse,
  transformTicketsToTimeSeries,
  calculateTicketStats,
  transformStatsToDataFrame,
  transformUsersAPIResponse,
  transformUsersToTimeSeries,
  calculateUserStats,
  transformOrganizationsAPIResponse,
  calculateOrganizationStats,
} from './utils/dataTransform';

export class DataSource extends DataSourceApi<ZendeskQuery, ZendeskConfig> {
  private client: ZendeskClient;

  constructor(instanceSettings: DataSourceInstanceSettings<ZendeskConfig>) {
    super(instanceSettings);

    const secureJsonData = instanceSettings.secureJsonData as ZendeskSecureJsonData;
    this.client = new ZendeskClient(instanceSettings.jsonData, secureJsonData);
  }

  /**
   * 處理查詢請求
   */
  query(request: DataQueryRequest<ZendeskQuery>): Observable<DataQueryResponse> {
    const promises = request.targets.map((target) => {
      if (!target.queryType) {
        return Promise.resolve(
          new MutableDataFrame({
            fields: [{ name: 'Error', type: FieldType.string, values: ['No query type specified'] }],
          })
        );
      }

      return this.executeQuery(target, request.range);
    });

    return from(Promise.all(promises)).pipe(
      map((dataFrames) => {
        // 如果查詢類型是 stats，返回統計 DataFrame
        const statsQueries = request.targets.filter((q) => q.queryType === QueryType.Stats);
        if (statsQueries.length > 0) {
          // 需要先獲取工單數據才能計算統計
          // 這裡簡化處理，實際應該根據查詢條件獲取數據
        }

        return {
          data: dataFrames.flat(),
        };
      }),
      catchError((error) => {
        console.error('Query error:', error);
        return of({
          data: [
            new MutableDataFrame({
              fields: [
                { name: 'Error', type: FieldType.string, values: [error.message || 'Unknown error'] },
              ],
            }),
          ],
        });
      })
    );
  }

  /**
   * 執行單個查詢
   */
  private async executeQuery(
    query: ZendeskQuery,
    timeRange?: { from: string; to: string }
  ): Promise<MutableDataFrame[]> {
    try {
      switch (query.queryType) {
        case QueryType.Tickets:
          return await this.queryTickets(query, timeRange);

        case QueryType.Search:
          return await this.querySearch(query, timeRange);

        case QueryType.TicketById:
          return await this.queryTicketById(query);

        case QueryType.Stats:
          return await this.queryStats(query, timeRange);

        case QueryType.Users:
          return await this.queryUsers(query, timeRange);

        case QueryType.Organizations:
          return await this.queryOrganizations(query, timeRange);

        case QueryType.UserStats:
          return await this.queryUserStats(query, timeRange);

        case QueryType.OrgStats:
          return await this.queryOrgStats(query, timeRange);

        default:
          throw new Error(`Unknown query type: ${query.queryType}`);
      }
    } catch (error) {
      console.error('Execute query error:', error);
      return [
        new MutableDataFrame({
          fields: [
            {
              name: 'Error',
              type: FieldType.string,
              values: [error instanceof Error ? error.message : 'Unknown error'],
            },
          ],
        }),
      ];
    }
  }

  /**
   * 查詢工單列表
   */
  private async queryTickets(
    query: ZendeskQuery,
    timeRange?: { from: string; to: string }
  ): Promise<MutableDataFrame[]> {
    const params: any = {
      page: query.page || 1,
      per_page: query.limit || 25,
    };

    if (query.status) {
      params.status = query.status;
    }
    if (query.priority) {
      params.priority = query.priority;
    }
    if (query.assigneeId) {
      params.assignee_id = query.assigneeId;
    }
    if (query.requesterId) {
      params.requester_id = query.requesterId;
    }

    const response = await this.client.getTickets(params);
    const dataFrame = transformAPIResponse(response, timeRange as any);

    // 如果查詢需要時間序列格式
    if (query.format === 'time_series') {
      const timeSeriesFrames = transformTicketsToTimeSeries(response.tickets, 'day');
      return timeSeriesFrames;
    }

    return [dataFrame as MutableDataFrame];
  }

  /**
   * 搜索工單
   */
  private async querySearch(
    query: ZendeskQuery,
    timeRange?: { from: string; to: string }
  ): Promise<MutableDataFrame[]> {
    if (!query.query) {
      throw new Error('Search query is required');
    }

    const response = await this.client.searchTickets(query.query, {
      page: query.page || 1,
      per_page: query.limit || 25,
    });

    const dataFrame = transformAPIResponse(response, timeRange as any);

    if (query.format === 'time_series') {
      const timeSeriesFrames = transformTicketsToTimeSeries(response.results, 'day');
      return timeSeriesFrames;
    }

    return [dataFrame as MutableDataFrame];
  }

  /**
   * 根據 ID 查詢工單
   */
  private async queryTicketById(query: ZendeskQuery): Promise<MutableDataFrame[]> {
    if (!query.ticketId) {
      throw new Error('Ticket ID is required');
    }

    const response = await this.client.getTicketById(query.ticketId);
    const dataFrame = transformAPIResponse({ tickets: [response.ticket] });

    return [dataFrame as MutableDataFrame];
  }

  /**
   * 查詢統計信息
   */
  private async queryStats(
    query: ZendeskQuery,
    timeRange?: { from: string; to: string }
  ): Promise<MutableDataFrame[]> {
    // 先獲取工單數據
    const params: any = {
      page: 1,
      per_page: query.limit || 100,
    };

    if (query.status) {
      params.status = query.status;
    }
    if (query.priority) {
      params.priority = query.priority;
    }

    const response = await this.client.getTickets(params);
    const stats = calculateTicketStats(response.tickets);
    const statsFrame = transformStatsToDataFrame(stats);

    return [statsFrame];
  }

  /**
   * 測試數據源連接
   */
  async testDatasource(): Promise<{ status: string; message: string }> {
    try {
      const result = await this.client.testConnection();
      return {
        status: result.success ? 'success' : 'error',
        message: result.message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 查詢用戶列表
   */
  private async queryUsers(
    query: ZendeskQuery,
    timeRange?: { from: string; to: string }
  ): Promise<MutableDataFrame[]> {
    const params: any = {
      page: query.page || 1,
      per_page: query.limit || 25,
    };

    if (query.userId) {
      const response = await this.client.getUserById(query.userId);
      const dataFrame = transformUsersAPIResponse({ users: [response.user] });
      return [dataFrame as MutableDataFrame];
    }

    const response = await this.client.getUsers(params);
    const dataFrame = transformUsersAPIResponse(response);

    if (query.format === 'time_series') {
      const timeSeriesFrames = transformUsersToTimeSeries(response.users, 'day');
      return timeSeriesFrames;
    }

    return [dataFrame as MutableDataFrame];
  }

  /**
   * 查詢組織列表
   */
  private async queryOrganizations(
    query: ZendeskQuery,
    timeRange?: { from: string; to: string }
  ): Promise<MutableDataFrame[]> {
    const params: any = {
      page: query.page || 1,
      per_page: query.limit || 25,
    };

    if (query.organizationId) {
      const response = await this.client.getOrganizationById(query.organizationId);
      const dataFrame = transformOrganizationsAPIResponse({
        organizations: [response.organization],
      });
      return [dataFrame as MutableDataFrame];
    }

    const response = await this.client.getOrganizations(params);
    const dataFrame = transformOrganizationsAPIResponse(response);

    return [dataFrame as MutableDataFrame];
  }

  /**
   * 查詢用戶統計信息
   */
  private async queryUserStats(
    query: ZendeskQuery,
    timeRange?: { from: string; to: string }
  ): Promise<MutableDataFrame[]> {
    const params: any = {
      page: 1,
      per_page: query.limit || 100,
    };

    const response = await this.client.getUsers(params);
    const stats = calculateUserStats(response.users);
    const statsFrame = new MutableDataFrame({
      fields: [
        { name: 'Metric', type: FieldType.string },
        { name: 'Value', type: FieldType.number },
      ],
    });

    statsFrame.appendRow(['Total Users', stats.total]);
    statsFrame.appendRow(['Active Users', stats.active]);

    for (const [role, count] of Object.entries(stats.byRole)) {
      statsFrame.appendRow([`Role: ${role}`, count]);
    }

    return [statsFrame];
  }

  /**
   * 查詢組織統計信息
   */
  private async queryOrgStats(
    query: ZendeskQuery,
    timeRange?: { from: string; to: string }
  ): Promise<MutableDataFrame[]> {
    const params: any = {
      page: 1,
      per_page: query.limit || 100,
    };

    const response = await this.client.getOrganizations(params);
    const stats = calculateOrganizationStats(response.organizations);
    const statsFrame = new MutableDataFrame({
      fields: [
        { name: 'Metric', type: FieldType.string },
        { name: 'Value', type: FieldType.number },
      ],
    });

    statsFrame.appendRow(['Total Organizations', stats.total]);
    statsFrame.appendRow(['With Shared Tickets', stats.withSharedTickets]);

    return [statsFrame];
  }

  /**
   * 獲取可用字段（可選）
   */
  async getFields(): Promise<string[]> {
    return [
      'id',
      'subject',
      'status',
      'priority',
      'created_at',
      'updated_at',
      'requester_id',
      'assignee_id',
      'organization_id',
      'tags',
    ];
  }
}

