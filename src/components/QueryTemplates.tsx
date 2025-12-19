import React, { useState, useCallback } from 'react';
import { Select, Input, Button, Modal, Field } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { QueryTemplate, ZendeskQuery, QueryType, TicketStatus, TicketPriority } from '../types';

/**
 * 預設查詢模板
 */
const DEFAULT_TEMPLATES: QueryTemplate[] = [
  {
    id: 'today-new-tickets',
    name: '今日新增工單',
    description: '查詢今天創建的新工單',
    category: 'Tickets',
    query: {
      queryType: QueryType.Tickets,
      status: TicketStatus.New,
      format: 'table',
    },
  },
  {
    id: 'unresolved-high-priority',
    name: '未解決的高優先級工單',
    description: '查詢未解決且優先級為高的工單',
    category: 'Tickets',
    query: {
      queryType: QueryType.Tickets,
      status: TicketStatus.Open,
      priority: TicketPriority.High,
      format: 'table',
    },
  },
  {
    id: 'my-pending-tickets',
    name: '我的待處理工單',
    description: '查詢分配給當前用戶的待處理工單',
    category: 'Tickets',
    query: {
      queryType: QueryType.Tickets,
      status: TicketStatus.Pending,
      format: 'table',
    },
  },
  {
    id: 'ticket-trends',
    name: '工單趨勢',
    description: '查看工單數量隨時間的變化趨勢',
    category: 'Analytics',
    query: {
      queryType: QueryType.Tickets,
      format: 'time_series',
    },
  },
  {
    id: 'user-stats',
    name: '用戶統計',
    description: '查看用戶統計信息',
    category: 'Analytics',
    query: {
      queryType: QueryType.UserStats,
      format: 'table',
    },
  },
  {
    id: 'org-stats',
    name: '組織統計',
    description: '查看組織統計信息',
    category: 'Analytics',
    query: {
      queryType: QueryType.OrgStats,
      format: 'table',
    },
  },
];

interface QueryTemplatesProps {
  onSelectTemplate: (template: QueryTemplate) => void;
  currentQuery?: Partial<ZendeskQuery>;
}

export const QueryTemplates: React.FC<QueryTemplatesProps> = ({ onSelectTemplate, currentQuery }) => {
  const [templates, setTemplates] = useState<QueryTemplate[]>(DEFAULT_TEMPLATES);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredTemplates = templates.filter(
    (template) => selectedCategory === 'all' || template.category === selectedCategory
  );

  const handleSelectTemplate = useCallback(
    (template: QueryTemplate) => {
      onSelectTemplate(template);
      setShowModal(false);
    },
    [onSelectTemplate]
  );

  return (
    <>
      <Button variant="secondary" onClick={() => setShowModal(true)}>
        Load Template
      </Button>

      {showModal && (
        <Modal
          title="Query Templates"
          isOpen={showModal}
          onDismiss={() => setShowModal(false)}
        >
          <div style={{ marginBottom: '16px' }}>
            <Field label="Category">
              <Select
                value={selectedCategory}
                options={categories.map((cat) => ({ label: cat, value: cat }))}
                onChange={(option: SelectableValue<string>) =>
                  setSelectedCategory(option.value || 'all')
                }
                width={30}
              />
            </Field>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSelectTemplate(template)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{template.name}</div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {template.description}
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>Category: {template.category}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};

