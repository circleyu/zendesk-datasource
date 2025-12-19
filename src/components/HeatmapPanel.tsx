import React from 'react';
import { PanelProps } from '@grafana/data';

interface SimpleOptions {
  // Panel options can be added here
}

interface HeatmapPanelProps extends PanelProps<SimpleOptions> {}

/**
 * 熱力圖面板組件
 * 用於顯示工單分布、時間-狀態、組織-優先級等熱力圖
 */
export const HeatmapPanel: React.FC<HeatmapPanelProps> = ({ data, options, width, height }) => {
  // 簡化實現 - 實際應該使用 D3.js 或類似庫來渲染熱力圖
  const frames = data.series;

  if (!frames || frames.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        No data available
      </div>
    );
  }

  // 提取數據用於熱力圖
  const heatmapData: Array<{ x: string; y: string; value: number }> = [];

  frames.forEach((frame) => {
    frame.fields.forEach((field) => {
      if (field.type === 'number' && field.values.length > 0) {
        field.values.forEach((value, index) => {
          if (typeof value === 'number') {
            heatmapData.push({
              x: field.name || 'Unknown',
              y: `Row ${index}`,
              value: value,
            });
          }
        });
      }
    });
  });

  // 計算顏色強度
  const maxValue = Math.max(...heatmapData.map((d) => d.value), 1);
  const getColorIntensity = (value: number) => {
    const intensity = Math.min(value / maxValue, 1);
    const hue = 240 - intensity * 240; // Blue to red
    return `hsl(${hue}, 100%, ${50 + intensity * 25}%)`;
  };

  return (
    <div style={{ width, height, padding: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))', gap: '2px' }}>
        {heatmapData.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: getColorIntensity(item.value),
              padding: '10px',
              textAlign: 'center',
              fontSize: '10px',
              color: item.value > maxValue / 2 ? 'white' : 'black',
            }}
            title={`${item.x} - ${item.y}: ${item.value}`}
          >
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
};

