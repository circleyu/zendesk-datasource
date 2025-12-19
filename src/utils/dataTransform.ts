import {
  DataFrame,
  FieldType,
  MutableDataFrame,
  TimeRange,
  toDataFrame,
} from '@grafana/data';
import { ZendeskTicket, ZendeskTicketsResponse, ZendeskSearchResponse } from '../types';

/**
 * 將 Zendesk 工單轉換為 Grafana DataFrame
 */
export function transformTicketsToDataFrame(
  tickets: ZendeskTicket[],
  timeRange?: TimeRange
): DataFrame {
  const frame = new MutableDataFrame({
    fields: [
      { name: 'Time', type: FieldType.time },
      { name: 'ID', type: FieldType.number },
      { name: 'Subject', type: FieldType.string },
      { name: 'Status', type: FieldType.string },
      { name: 'Priority', type: FieldType.string },
      { name: 'Created', type: FieldType.time },
      { name: 'Updated', type: FieldType.time },
      { name: 'Requester ID', type: FieldType.number },
      { name: 'Assignee ID', type: FieldType.number },
    ],
  });

  for (const ticket of tickets) {
    const createdTime = new Date(ticket.created_at).getTime();
    const updatedTime = new Date(ticket.updated_at).getTime();

    // 使用創建時間作為主要時間字段
    const timeValue = timeRange ? createdTime : updatedTime;

    frame.appendRow([
      timeValue,
      ticket.id,
      ticket.subject || '',
      ticket.status,
      ticket.priority || '',
      createdTime,
      updatedTime,
      ticket.requester_id,
      ticket.assignee_id || null,
    ]);
  }

  return frame;
}

/**
 * 將工單轉換為時間序列數據（用於圖表）
 */
export function transformTicketsToTimeSeries(
  tickets: ZendeskTicket[],
  groupBy: 'status' | 'priority' | 'day' | 'hour' = 'day'
): DataFrame[] {
  const frames: MutableDataFrame[] = [];
  const dataMap = new Map<string, Map<number, number>>();

  for (const ticket of tickets) {
    const time = new Date(ticket.created_at).getTime();
    let key: string;

    switch (groupBy) {
      case 'status':
        key = ticket.status;
        break;
      case 'priority':
        key = ticket.priority || 'normal';
        break;
      case 'day':
        const day = new Date(ticket.created_at);
        day.setHours(0, 0, 0, 0);
        key = day.toISOString();
        break;
      case 'hour':
        const hour = new Date(ticket.created_at);
        hour.setMinutes(0, 0, 0);
        key = hour.toISOString();
        break;
      default:
        key = 'all';
    }

    if (!dataMap.has(key)) {
      dataMap.set(key, new Map());
    }

    const timeMap = dataMap.get(key)!;
    const roundedTime = groupBy === 'day' || groupBy === 'hour' 
      ? new Date(key).getTime() 
      : time;
    
    const count = timeMap.get(roundedTime) || 0;
    timeMap.set(roundedTime, count + 1);
  }

  // 為每個分組創建一個 DataFrame
  for (const [key, timeMap] of dataMap.entries()) {
    const frame = new MutableDataFrame({
      name: key,
      fields: [
        { name: 'Time', type: FieldType.time },
        { name: 'Count', type: FieldType.number },
      ],
    });

    const sortedTimes = Array.from(timeMap.keys()).sort((a, b) => a - b);
    for (const time of sortedTimes) {
      frame.appendRow([time, timeMap.get(time)]);
    }

    frames.push(frame);
  }

  return frames;
}

/**
 * 計算工單統計信息
 */
export function calculateTicketStats(tickets: ZendeskTicket[]): {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  averageResolutionTime?: number;
} {
  const stats = {
    total: tickets.length,
    byStatus: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    averageResolutionTime: undefined as number | undefined,
  };

  let totalResolutionTime = 0;
  let resolvedCount = 0;

  for (const ticket of tickets) {
    // 按狀態統計
    stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;

    // 按優先級統計
    const priority = ticket.priority || 'normal';
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

    // 計算平均解決時間（僅已解決的工單）
    if (ticket.status === 'solved' && ticket.updated_at && ticket.created_at) {
      const created = new Date(ticket.created_at).getTime();
      const updated = new Date(ticket.updated_at).getTime();
      totalResolutionTime += updated - created;
      resolvedCount++;
    }
  }

  if (resolvedCount > 0) {
    stats.averageResolutionTime = totalResolutionTime / resolvedCount;
  }

  return stats;
}

/**
 * 將 API 響應轉換為 DataFrame
 */
export function transformAPIResponse(
  response: ZendeskTicketsResponse | ZendeskSearchResponse,
  timeRange?: TimeRange
): DataFrame {
  let tickets: ZendeskTicket[];

  if ('tickets' in response) {
    tickets = response.tickets;
  } else if ('results' in response) {
    tickets = response.results;
  } else {
    tickets = [];
  }

  return transformTicketsToDataFrame(tickets, timeRange);
}

/**
 * 將統計數據轉換為 DataFrame
 */
export function transformStatsToDataFrame(stats: {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  averageResolutionTime?: number;
}): DataFrame {
  const frame = new MutableDataFrame({
    fields: [
      { name: 'Metric', type: FieldType.string },
      { name: 'Value', type: FieldType.number },
    ],
  });

  frame.appendRow(['Total Tickets', stats.total]);

  for (const [status, count] of Object.entries(stats.byStatus)) {
    frame.appendRow([`Status: ${status}`, count]);
  }

  for (const [priority, count] of Object.entries(stats.byPriority)) {
    frame.appendRow([`Priority: ${priority}`, count]);
  }

  if (stats.averageResolutionTime !== undefined) {
    const hours = stats.averageResolutionTime / (1000 * 60 * 60);
    frame.appendRow(['Average Resolution Time (hours)', hours]);
  }

  return frame;
}

