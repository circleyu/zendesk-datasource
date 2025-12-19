import React, { useCallback, useState } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { Select, Input, InlineField, InlineFieldRow } from '@grafana/ui';
import { ZendeskQuery, QueryType, TicketStatus, TicketPriority } from './types';

type Props = QueryEditorProps<any, ZendeskQuery>;

const queryTypeOptions: Array<SelectableValue<QueryType>> = [
  { label: 'Tickets', value: QueryType.Tickets },
  { label: 'Search', value: QueryType.Search },
  { label: 'Ticket by ID', value: QueryType.TicketById },
  { label: 'Stats', value: QueryType.Stats },
];

const statusOptions: Array<SelectableValue<TicketStatus>> = [
  { label: 'New', value: TicketStatus.New },
  { label: 'Open', value: TicketStatus.Open },
  { label: 'Pending', value: TicketStatus.Pending },
  { label: 'Hold', value: TicketStatus.Hold },
  { label: 'Solved', value: TicketStatus.Solved },
  { label: 'Closed', value: TicketStatus.Closed },
];

const priorityOptions: Array<SelectableValue<TicketPriority>> = [
  { label: 'Low', value: TicketPriority.Low },
  { label: 'Normal', value: TicketPriority.Normal },
  { label: 'High', value: TicketPriority.High },
  { label: 'Urgent', value: TicketPriority.Urgent },
];

const formatOptions: Array<SelectableValue<string>> = [
  { label: 'Table', value: 'table' },
  { label: 'Time Series', value: 'time_series' },
];

export const QueryEditor: React.FC<Props> = ({ query, onChange, onRunQuery }) => {
  const [localQuery, setLocalQuery] = useState<ZendeskQuery>({
    ...query,
    queryType: query.queryType || QueryType.Tickets,
  });

  const updateQuery = useCallback(
    (updates: Partial<ZendeskQuery>) => {
      const newQuery = { ...localQuery, ...updates };
      setLocalQuery(newQuery);
      onChange(newQuery);
    },
    [localQuery, onChange]
  );

  const onQueryTypeChange = useCallback(
    (value: SelectableValue<QueryType>) => {
      updateQuery({ queryType: value.value });
      onRunQuery();
    },
    [updateQuery, onRunQuery]
  );

  const onStatusChange = useCallback(
    (value: SelectableValue<TicketStatus>) => {
      updateQuery({ status: value.value });
      onRunQuery();
    },
    [updateQuery, onRunQuery]
  );

  const onPriorityChange = useCallback(
    (value: SelectableValue<TicketPriority>) => {
      updateQuery({ priority: value.value });
      onRunQuery();
    },
    [updateQuery, onRunQuery]
  );

  const onTicketIdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const ticketId = parseInt(event.target.value, 10);
      updateQuery({ ticketId: isNaN(ticketId) ? undefined : ticketId });
    },
    [updateQuery]
  );

  const onSearchQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateQuery({ query: event.target.value });
    },
    [updateQuery]
  );

  const onAssigneeIdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const assigneeId = parseInt(event.target.value, 10);
      updateQuery({ assigneeId: isNaN(assigneeId) ? undefined : assigneeId });
    },
    [updateQuery]
  );

  const onRequesterIdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const requesterId = parseInt(event.target.value, 10);
      updateQuery({ requesterId: isNaN(requesterId) ? undefined : requesterId });
    },
    [updateQuery]
  );

  const onLimitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const limit = parseInt(event.target.value, 10);
      updateQuery({ limit: isNaN(limit) ? undefined : limit });
    },
    [updateQuery]
  );

  const onFormatChange = useCallback(
    (value: SelectableValue<string>) => {
      updateQuery({ format: value.value as any });
      onRunQuery();
    },
    [updateQuery, onRunQuery]
  );

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Query Type" labelWidth={14} grow>
          <Select
            value={localQuery.queryType}
            options={queryTypeOptions}
            onChange={onQueryTypeChange}
            width={30}
          />
        </InlineField>
      </InlineFieldRow>

      {localQuery.queryType === QueryType.TicketById && (
        <InlineFieldRow>
          <InlineField label="Ticket ID" labelWidth={14} grow>
            <Input
              type="number"
              value={localQuery.ticketId || ''}
              onChange={onTicketIdChange}
              onBlur={onRunQuery}
              placeholder="Enter ticket ID"
              width={30}
            />
          </InlineField>
        </InlineFieldRow>
      )}

      {localQuery.queryType === QueryType.Search && (
        <InlineFieldRow>
          <InlineField label="Search Query" labelWidth={14} grow>
            <Input
              value={localQuery.query || ''}
              onChange={onSearchQueryChange}
              onBlur={onRunQuery}
              placeholder="e.g., status:open priority:high"
              width={30}
            />
          </InlineField>
        </InlineFieldRow>
      )}

      {(localQuery.queryType === QueryType.Tickets || localQuery.queryType === QueryType.Stats) && (
        <>
          <InlineFieldRow>
            <InlineField label="Status" labelWidth={14} grow>
              <Select
                value={localQuery.status}
                options={statusOptions}
                onChange={onStatusChange}
                isClearable
                width={30}
              />
            </InlineField>
          </InlineFieldRow>

          <InlineFieldRow>
            <InlineField label="Priority" labelWidth={14} grow>
              <Select
                value={localQuery.priority}
                options={priorityOptions}
                onChange={onPriorityChange}
                isClearable
                width={30}
              />
            </InlineField>
          </InlineFieldRow>

          <InlineFieldRow>
            <InlineField label="Assignee ID" labelWidth={14} grow>
              <Input
                type="number"
                value={localQuery.assigneeId || ''}
                onChange={onAssigneeIdChange}
                onBlur={onRunQuery}
                placeholder="Filter by assignee"
                width={30}
              />
            </InlineField>
          </InlineFieldRow>

          <InlineFieldRow>
            <InlineField label="Requester ID" labelWidth={14} grow>
              <Input
                type="number"
                value={localQuery.requesterId || ''}
                onChange={onRequesterIdChange}
                onBlur={onRunQuery}
                placeholder="Filter by requester"
                width={30}
              />
            </InlineField>
          </InlineFieldRow>
        </>
      )}

      <InlineFieldRow>
        <InlineField label="Limit" labelWidth={14} grow>
          <Input
            type="number"
            value={localQuery.limit || 25}
            onChange={onLimitChange}
            onBlur={onRunQuery}
            placeholder="Number of results"
            width={30}
          />
        </InlineField>
      </InlineFieldRow>

      <InlineFieldRow>
        <InlineField label="Format" labelWidth={14} grow>
          <Select
            value={localQuery.format || 'table'}
            options={formatOptions}
            onChange={onFormatChange}
            width={30}
          />
        </InlineField>
      </InlineFieldRow>
    </div>
  );
};

