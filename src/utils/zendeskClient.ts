import {
  ZendeskConfig,
  ZendeskSecureJsonData,
  ZendeskTicket,
  ZendeskTicketsResponse,
  ZendeskTicketResponse,
  ZendeskSearchResponse,
  ZendeskErrorResponse,
  TicketStatus,
  TicketPriority,
} from '../types';

/**
 * Zendesk API 客戶端
 */
export class ZendeskClient {
  private subdomain: string;
  private email: string;
  private apiToken: string;
  private baseUrl: string;

  constructor(config: ZendeskConfig, secureJsonData?: ZendeskSecureJsonData) {
    this.subdomain = config.subdomain || '';
    this.email = config.email || '';
    this.apiToken = secureJsonData?.apiToken || config.apiToken || '';
    this.baseUrl = `https://${this.subdomain}.zendesk.com/api/v2`;
  }

  /**
   * 構建認證頭
   */
  private getAuthHeaders(): HeadersInit {
    const credentials = `${this.email}/token:${this.apiToken}`;
    const encoded = btoa(credentials);
    return {
      'Authorization': `Basic ${encoded}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 發送 API 請求
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData: ZendeskErrorResponse = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // 處理 204 No Content 響應
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * 處理速率限制
   */
  private async handleRateLimit(response: Response): Promise<void> {
    const rateLimitRemaining = response.headers.get('X-Rate-Limit-Remaining');
    const rateLimitReset = response.headers.get('X-Rate-Limit-Reset');

    if (rateLimitRemaining === '0' && rateLimitReset) {
      const resetTime = parseInt(rateLimitReset, 10) * 1000;
      const waitTime = resetTime - Date.now();
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * 獲取工單列表
   */
  async getTickets(params?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignee_id?: number;
    requester_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<ZendeskTicketsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.priority) {
      queryParams.append('priority', params.priority);
    }
    if (params?.assignee_id) {
      queryParams.append('assignee_id', params.assignee_id.toString());
    }
    if (params?.requester_id) {
      queryParams.append('requester_id', params.requester_id.toString());
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const queryString = queryParams.toString();
    const endpoint = `/tickets.json${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ZendeskTicketsResponse>(endpoint);
  }

  /**
   * 根據 ID 獲取單個工單
   */
  async getTicketById(id: number): Promise<ZendeskTicketResponse> {
    return this.request<ZendeskTicketResponse>(`/tickets/${id}.json`);
  }

  /**
   * 搜索工單
   */
  async searchTickets(query: string, params?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<ZendeskSearchResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const endpoint = `/search.json?${queryParams.toString()}`;
    return this.request<ZendeskSearchResponse>(endpoint);
  }

  /**
   * 測試連接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // 嘗試獲取當前用戶信息來測試連接
      const response = await fetch(`${this.baseUrl}/users/me.json`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Connection successful',
        };
      } else {
        const errorData: ZendeskErrorResponse = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        return {
          success: false,
          message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

