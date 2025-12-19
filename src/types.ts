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
  Users = 'users',
  Organizations = 'organizations',
  UserStats = 'userStats',
  OrgStats = 'orgStats',
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
  userId?: number; // 用戶 ID（用於用戶查詢）
  organizationId?: number; // 組織 ID（用於組織查詢）
  advancedFilters?: AdvancedFilter[]; // 高級過濾器
  templateId?: string; // 查詢模板 ID
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

/**
 * Zendesk 用戶數據結構
 */
export interface ZendeskUser {
  id: number;
  url: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  time_zone?: string;
  iana_time_zone?: string;
  phone?: string;
  shared_phone_number?: boolean;
  photo?: {
    url: string;
    id: number;
    file_name: string;
    content_url: string;
    mapped_content_url: string;
    content_type: string;
    size: number;
    width: number;
    height: number;
  };
  locale_id?: number;
  locale?: string;
  organization_id?: number;
  role: 'end-user' | 'agent' | 'admin';
  verified: boolean;
  external_id?: string;
  tags?: string[];
  alias?: string;
  active: boolean;
  shared: boolean;
  shared_agent: boolean;
  last_login_at?: string;
  two_factor_auth_enabled?: boolean;
  signature?: string;
  details?: string;
  notes?: string;
  role_type?: number;
  custom_role_id?: number;
  moderator?: boolean;
  ticket_restriction?: 'assigned' | 'groups' | 'organization' | 'requested';
  only_private_comments?: boolean;
  restricted_agent?: boolean;
  suspended?: boolean;
  chat_only?: boolean;
  default_group_id?: number;
  report_csv?: boolean;
  user_fields?: Array<{
    id: number;
    value: string | number | boolean;
  }>;
}

/**
 * Zendesk 組織數據結構
 */
export interface ZendeskOrganization {
  id: number;
  url: string;
  external_id?: string;
  name: string;
  created_at: string;
  updated_at: string;
  domain_names?: string[];
  details?: string;
  notes?: string;
  group_id?: number;
  shared_tickets?: boolean;
  shared_comments?: boolean;
  tags?: string[];
  organization_fields?: Array<{
    id: number;
    value: string | number | boolean;
  }>;
}

/**
 * 高級過濾器
 */
export interface AdvancedFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';
  value: string | number | boolean;
  logic?: 'AND' | 'OR';
}

/**
 * 查詢模板
 */
export interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  query: Partial<ZendeskQuery>;
  category: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 用戶列表響應
 */
export interface ZendeskUsersResponse extends ZendeskAPIResponse<ZendeskUser[]> {
  users: ZendeskUser[];
}

/**
 * 單個用戶響應
 */
export interface ZendeskUserResponse {
  user: ZendeskUser;
}

/**
 * 組織列表響應
 */
export interface ZendeskOrganizationsResponse extends ZendeskAPIResponse<ZendeskOrganization[]> {
  organizations: ZendeskOrganization[];
}

/**
 * 單個組織響應
 */
export interface ZendeskOrganizationResponse {
  organization: ZendeskOrganization;
}

