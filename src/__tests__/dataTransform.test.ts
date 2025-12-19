import {
  transformTicketsToDataFrame,
  transformTicketsToTimeSeries,
  calculateTicketStats,
} from '../utils/dataTransform';
import { ZendeskTicket } from '../types';

describe('dataTransform', () => {
  const mockTickets: ZendeskTicket[] = [
    {
      id: 1,
      url: 'https://test.zendesk.com/api/v2/tickets/1.json',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T01:00:00Z',
      subject: 'Test Ticket 1',
      status: 'open',
      priority: 'high',
      requester_id: 100,
      assignee_id: 200,
      tags: ['tag1', 'tag2'],
    },
    {
      id: 2,
      url: 'https://test.zendesk.com/api/v2/tickets/2.json',
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T01:00:00Z',
      subject: 'Test Ticket 2',
      status: 'solved',
      priority: 'normal',
      requester_id: 101,
      assignee_id: 201,
      tags: ['tag2', 'tag3'],
    },
  ];

  describe('transformTicketsToDataFrame', () => {
    it('should transform tickets to DataFrame', () => {
      const frame = transformTicketsToDataFrame(mockTickets);
      expect(frame).toBeDefined();
      expect(frame.fields.length).toBeGreaterThan(0);
      expect(frame.length).toBe(2);
    });

    it('should handle empty tickets array', () => {
      const frame = transformTicketsToDataFrame([]);
      expect(frame).toBeDefined();
      expect(frame.length).toBe(0);
    });
  });

  describe('transformTicketsToTimeSeries', () => {
    it('should transform tickets to time series', () => {
      const frames = transformTicketsToTimeSeries(mockTickets, 'day');
      expect(frames).toBeDefined();
      expect(Array.isArray(frames)).toBe(true);
    });
  });

  describe('calculateTicketStats', () => {
    it('should calculate ticket statistics', () => {
      const stats = calculateTicketStats(mockTickets);
      expect(stats).toBeDefined();
      expect(stats.total).toBe(2);
      expect(stats.byStatus).toBeDefined();
      expect(stats.byPriority).toBeDefined();
    });
  });
});

