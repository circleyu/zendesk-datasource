import { ZendeskQuery } from '../types';

const STORAGE_KEY = 'zendesk-query-history';
const MAX_HISTORY_ITEMS = 50;

export interface QueryHistoryItem {
  id: string;
  query: Partial<ZendeskQuery>;
  name?: string;
  timestamp: number;
  executedAt: string;
}

/**
 * 查詢歷史管理器
 */
export class QueryHistoryManager {
  /**
   * 保存查詢到歷史記錄
   */
  static saveQuery(query: Partial<ZendeskQuery>, name?: string): void {
    try {
      const history = this.getHistory();
      const newItem: QueryHistoryItem = {
        id: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        name: name || this.generateQueryName(query),
        timestamp: Date.now(),
        executedAt: new Date().toISOString(),
      };

      // 移除重複的查詢（基於查詢內容）
      const filteredHistory = history.filter(
        (item) => JSON.stringify(item.query) !== JSON.stringify(query)
      );

      // 添加到開頭
      filteredHistory.unshift(newItem);

      // 限制歷史記錄數量
      const limitedHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Failed to save query history:', error);
    }
  }

  /**
   * 獲取查詢歷史
   */
  static getHistory(): QueryHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored) as QueryHistoryItem[];
    } catch (error) {
      console.error('Failed to load query history:', error);
      return [];
    }
  }

  /**
   * 根據 ID 獲取查詢
   */
  static getQueryById(id: string): QueryHistoryItem | null {
    const history = this.getHistory();
    return history.find((item) => item.id === id) || null;
  }

  /**
   * 搜索查詢歷史
   */
  static searchHistory(searchTerm: string): QueryHistoryItem[] {
    const history = this.getHistory();
    const term = searchTerm.toLowerCase();
    return history.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        JSON.stringify(item.query).toLowerCase().includes(term)
    );
  }

  /**
   * 刪除查詢歷史項
   */
  static deleteQuery(id: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete query history:', error);
    }
  }

  /**
   * 清空查詢歷史
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear query history:', error);
    }
  }

  /**
   * 生成查詢名稱
   */
  private static generateQueryName(query: Partial<ZendeskQuery>): string {
    const parts: string[] = [];

    if (query.queryType) {
      parts.push(query.queryType);
    }

    if (query.status) {
      parts.push(`status:${query.status}`);
    }

    if (query.priority) {
      parts.push(`priority:${query.priority}`);
    }

    if (query.query) {
      parts.push(`search:${query.query.substring(0, 20)}`);
    }

    return parts.length > 0 ? parts.join(' ') : 'Untitled Query';
  }
}

