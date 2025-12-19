import React from 'react';
import { PanelProps, FieldType } from '@grafana/data';

interface SimpleOptions {
  // Panel options can be added here
}

interface GanttChartPanelProps extends PanelProps<SimpleOptions> {}

/**
 * 甘特圖面板組件
 * 用於顯示工單生命週期和狀態轉換時間線
 */
export const GanttChartPanel: React.FC<GanttChartPanelProps> = ({ data, options, width, height }) => {
  const frames = data.series;

  if (!frames || frames.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        No data available
      </div>
    );
  }

  // 提取時間範圍數據
  const ganttItems: Array<{
    id: string;
    label: string;
    start: number;
    end: number;
    status: string;
  }> = [];

  frames.forEach((frame) => {
    const timeField = frame.fields.find((f) => f.type === FieldType.time);
    const statusField = frame.fields.find((f) => f.name === 'Status');
    const idField = frame.fields.find((f) => f.name === 'ID');

    if (timeField && timeField.values.length > 0) {
      timeField.values.forEach((timeValue, index) => {
        const time = typeof timeValue === 'number' ? timeValue : new Date(timeValue).getTime();
        const status = statusField?.values[index] || 'unknown';
        const id = idField?.values[index] || index;

        // 簡化：假設每個時間點代表一個狀態轉換
        ganttItems.push({
          id: String(id),
          label: `Ticket ${id}`,
          start: time,
          end: time + 3600000, // 1 hour default duration
          status: String(status),
        });
      });
    }
  });

  // 計算時間範圍
  const times = ganttItems.map((item) => [item.start, item.end]).flat();
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeRange = maxTime - minTime || 1;

  // 狀態顏色映射
  const statusColors: Record<string, string> = {
    new: '#3498db',
    open: '#2ecc71',
    pending: '#f39c12',
    hold: '#e74c3c',
    solved: '#95a5a6',
    closed: '#34495e',
  };

  return (
    <div style={{ width, height, padding: '10px', overflow: 'auto' }}>
      <svg width={width - 20} height={Math.max(ganttItems.length * 40, 200)}>
        {ganttItems.map((item, index) => {
          const x = ((item.start - minTime) / timeRange) * (width - 100);
          const widthBar = ((item.end - item.start) / timeRange) * (width - 100);
          const y = index * 40 + 20;

          return (
            <g key={item.id}>
              <rect
                x={x}
                y={y - 10}
                width={Math.max(widthBar, 5)}
                height={20}
                fill={statusColors[item.status.toLowerCase()] || '#95a5a6'}
                stroke="#333"
                strokeWidth={1}
              />
              <text
                x={x + 5}
                y={y + 5}
                fontSize="12"
                fill="white"
                style={{ pointerEvents: 'none' }}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

