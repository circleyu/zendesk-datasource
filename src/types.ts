import { DataQuery, DataSourceJsonData } from '@grafana/data';

/**
 * Zendesk 配置接口
 */
export interface ZendeskConfig extends DataSourceJsonData {
  subdomain?: string;
  email?: string;
  apiToken?: string;
}

/**
 * Zendesk 安全配置（敏感信息）
 */
export interface ZendeskSecureJsonData {
  apiToken?: string;
}

/**
 * 查詢類型枚舉
 */
export enum QueryType {
  Tickets = 'tickets',
  Search = 'search',
  TicketById = 'ticketById',
  Stats = 'stats',
}

/**
 * 工單狀態
 */
export enum TicketStatus {
  New = 'new',
  Open = 'open',
  Pending = 'pending',
  Hold = 'hold',
  Solved = 'solved',
  Closed = 'closed',
}

/**
 * 工單優先級
 */
export enum TicketPriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
  Urgent = 'urgent',
}

/**
 * Zendesk 查詢接口
 */
export interface ZendeskQuery extends DataQuery {
  queryType?: QueryType;
  ticketId?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: number;
  requesterId?: number;
  timeRange?: {
    from?: string;
    to?: string;
  };
  fields?: string[];
  limit?: number;
  page?: number;
  query?: string; // 搜索查詢字符串
  format?: 'table' | 'time_series'; // 數據格式
}

/**
 * Zendesk 工單數據結構
 */
export interface ZendeskTicket {
  id: number;
  url: string;
  external_id?: string;
  created_at: string;
  updated_at: string;
  type?: string;
  subject?: string;
  raw_subject?: string;
  description?: string;
  priority?: TicketPriority;
  status: TicketStatus;
  recipient?: string;
  requester_id: number;
  submitter_id: number;
  assignee_id?: number;
  organization_id?: number;
  group_id?: number;
  collaborator_ids?: number[];
  follower_ids?: number[];
  email_cc_ids?: number[];
  forum_topic_id?: number;
  problem_id?: number;
  has_incidents: boolean;
  is_public: boolean;
  due_at?: string;
  tags?: string[];
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean;
  }>;
  satisfaction_rating?: {
    id: number;
    score: string;
  };
  sharing_agreement_ids?: number[];
  fields?: Array<{
    id: number;
    value: string | number | boolean;
  }>;
  followup_ids?: number[];
  ticket_form_id?: number;
  brand_id?: number;
  allow_channelback: boolean;
  allow_attachments: boolean;
}

/**
 * Zendesk API 響應結構
 */
export interface ZendeskAPIResponse<T> {
  [key: string]: T | any;
  count?: number;
  next_page?: string;
  previous_page?: string;
}

/**
 * 工單列表響應
 */
export interface ZendeskTicketsResponse extends ZendeskAPIResponse<ZendeskTicket[]> {
  tickets: ZendeskTicket[];
}

/**
 * 單個工單響應
 */
export interface ZendeskTicketResponse {
  ticket: ZendeskTicket;
}

/**
 * 搜索響應
 */
export interface ZendeskSearchResponse extends ZendeskAPIResponse<ZendeskTicket[]> {
  results: ZendeskTicket[];
}

/**
 * API 錯誤響應
 */
export interface ZendeskErrorResponse {
  error: string;
  description?: string;
}

