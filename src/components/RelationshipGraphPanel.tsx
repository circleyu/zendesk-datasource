import React, { useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';

interface SimpleOptions {
  // Panel options can be added here
}

interface RelationshipGraphPanelProps extends PanelProps<SimpleOptions> {}

/**
 * 關聯圖面板組件
 * 用於顯示工單關聯網絡、用戶-工單關係、組織-工單關係
 */
export const RelationshipGraphPanel: React.FC<RelationshipGraphPanelProps> = ({ data, options, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = data.series;

  useEffect(() => {
    if (!canvasRef.current || !frames || frames.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // 設置畫布大小
    canvas.width = width - 20;
    canvas.height = height - 20;

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 提取節點和邊
    const nodes: Array<{ id: string; label: string; x: number; y: number; type: string }> = [];
    const edges: Array<{ from: string; to: string }> = [];

    frames.forEach((frame) => {
      const idField = frame.fields.find((f) => f.name === 'ID');
      const requesterField = frame.fields.find((f) => f.name === 'Requester ID');
      const assigneeField = frame.fields.find((f) => f.name === 'Assignee ID');

      if (idField && idField.values.length > 0) {
        idField.values.forEach((id, index) => {
          const nodeId = `ticket-${id}`;
          nodes.push({
            id: nodeId,
            label: `Ticket ${id}`,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            type: 'ticket',
          });

          // 添加關係邊
          if (requesterField && requesterField.values[index]) {
            const requesterId = `user-${requesterField.values[index]}`;
            edges.push({ from: requesterId, to: nodeId });
          }

          if (assigneeField && assigneeField.values[index]) {
            const assigneeId = `user-${assigneeField.values[index]}`;
            edges.push({ from: nodeId, to: assigneeId });
          }
        });
      }
    });

    // 繪製邊
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });

    // 繪製節點
    nodes.forEach((node) => {
      ctx.fillStyle = node.type === 'ticket' ? '#3498db' : '#2ecc71';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 繪製標籤
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 30);
    });
  }, [frames, width, height]);

  if (!frames || frames.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ width, height, padding: '10px' }}>
      <canvas ref={canvasRef} style={{ border: '1px solid #ddd', borderRadius: '4px' }} />
    </div>
  );
};

