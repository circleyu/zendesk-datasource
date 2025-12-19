/**
 * 請求批處理器
 * 用於合併相似的請求，減少 API 調用次數
 */

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  params: Record<string, any>;
}

interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number; // 最大等待時間（毫秒）
}

/**
 * 請求批處理器類
 */
export class RequestBatcher<TRequest, TResponse> {
  private pendingRequests: Map<string, PendingRequest<TResponse>[]>;
  private batchTimers: Map<string, NodeJS.Timeout>;
  private batchFunction: (params: TRequest[]) => Promise<TResponse[]>;
  private config: BatchConfig;

  constructor(
    batchFunction: (params: TRequest[]) => Promise<TResponse[]>,
    config: Partial<BatchConfig> = {}
  ) {
    this.pendingRequests = new Map();
    this.batchTimers = new Map();
    this.batchFunction = batchFunction;
    this.config = {
      maxBatchSize: config.maxBatchSize || 10,
      maxWaitTime: config.maxWaitTime || 100, // 100ms
    };
  }

  /**
   * 生成請求鍵
   */
  private generateKey(params: TRequest): string {
    return JSON.stringify(params);
  }

  /**
   * 添加請求到批處理隊列
   */
  async add(params: TRequest): Promise<TResponse> {
    const key = this.generateKey(params);

    return new Promise<TResponse>((resolve, reject) => {
      // 獲取或創建待處理請求列表
      if (!this.pendingRequests.has(key)) {
        this.pendingRequests.set(key, []);
      }

      const pendingList = this.pendingRequests.get(key)!;
      pendingList.push({ resolve, reject, params: params as any });

      // 如果達到最大批次大小，立即執行
      if (pendingList.length >= this.config.maxBatchSize) {
        this.executeBatch(key);
      } else {
        // 否則設置定時器
        this.scheduleBatch(key);
      }
    });
  }

  /**
   * 安排批次執行
   */
  private scheduleBatch(key: string): void {
    // 清除現有定時器
    if (this.batchTimers.has(key)) {
      clearTimeout(this.batchTimers.get(key)!);
    }

    // 設置新定時器
    const timer = setTimeout(() => {
      this.executeBatch(key);
    }, this.config.maxWaitTime);

    this.batchTimers.set(key, timer);
  }

  /**
   * 執行批次請求
   */
  private async executeBatch(key: string): void {
    const pendingList = this.pendingRequests.get(key);
    if (!pendingList || pendingList.length === 0) {
      return;
    }

    // 清除定時器
    if (this.batchTimers.has(key)) {
      clearTimeout(this.batchTimers.get(key)!);
      this.batchTimers.delete(key);
    }

    // 從待處理列表中移除
    this.pendingRequests.delete(key);

    // 提取所有請求參數
    const requests = pendingList.map((item) => item.params as TRequest);

    try {
      // 執行批次請求
      const responses = await this.batchFunction(requests);

      // 分發響應
      pendingList.forEach((item, index) => {
        if (responses[index] !== undefined) {
          item.resolve(responses[index]);
        } else {
          item.reject(new Error('No response received for request'));
        }
      });
    } catch (error) {
      // 所有請求都失敗
      pendingList.forEach((item) => {
        item.reject(error instanceof Error ? error : new Error('Batch request failed'));
      });
    }
  }

  /**
   * 清空所有待處理的請求
   */
  clear(): void {
    // 清除所有定時器
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();

    // 拒絕所有待處理的請求
    for (const pendingList of this.pendingRequests.values()) {
      pendingList.forEach((item) => {
        item.reject(new Error('Request batcher cleared'));
      });
    }
    this.pendingRequests.clear();
  }
}

