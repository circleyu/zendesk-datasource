/**
 * 緩存項接口
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * 緩存管理器
 * 實現 LRU (Least Recently Used) 緩存策略
 */
export class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private maxSize: number;
  private defaultTTL: number; // 默認 TTL: 5 分鐘

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * 生成緩存鍵
   */
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}|${sortedParams}`;
  }

  /**
   * 獲取緩存數據
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 檢查是否過期
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新訪問時間（LRU）
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.data as T;
  }

  /**
   * 設置緩存數據
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // 如果緩存已滿，移除最舊的項
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, item);
  }

  /**
   * 刪除緩存項
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 根據模式刪除緩存項
   */
  deleteByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清空所有緩存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理過期項
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 獲取緩存統計信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // 可以擴展實現命中率追蹤
    };
  }

  /**
   * 生成查詢緩存鍵
   */
  generateQueryKey(queryType: string, params: Record<string, any>): string {
    return this.generateKey(`query:${queryType}`, params);
  }
}

// 導出單例實例
export const cacheManager = new CacheManager();

