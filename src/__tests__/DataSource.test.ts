import { DataSource } from '../DataSource';
import { ZendeskQuery, QueryType } from '../types';

// Mock the ZendeskClient
jest.mock('../utils/zendeskClient', () => ({
  ZendeskClient: jest.fn().mockImplementation(() => ({
    getTickets: jest.fn().mockResolvedValue({
      tickets: [
        {
          id: 1,
          subject: 'Test Ticket',
          status: 'open',
          priority: 'high',
          created_at: '2025-01-01T00:00:00Z',
        },
      ],
    })),
    testConnection: jest.fn().mockResolvedValue({ success: true, message: 'OK' }),
  })),
}));

describe('DataSource', () => {
  let dataSource: DataSource;
  let mockInstanceSettings: any;

  beforeEach(() => {
    mockInstanceSettings = {
      id: 1,
      uid: 'test-uid',
      name: 'test-datasource',
      type: 'zendesk',
      jsonData: {
        subdomain: 'test',
        email: 'test@example.com',
      },
      secureJsonData: {
        apiToken: 'test-token',
      },
    };

    dataSource = new DataSource(mockInstanceSettings);
  });

  describe('query', () => {
    it('should handle tickets query', async () => {
      const query: ZendeskQuery = {
        refId: 'A',
        queryType: QueryType.Tickets,
        status: 'open',
      };

      const request = {
        targets: [query],
        range: {
          from: { valueOf: () => Date.now() - 86400000 },
          to: { valueOf: () => Date.now() },
        },
      } as any;

      const result = await dataSource.query(request).toPromise();
      expect(result).toBeDefined();
      expect(result?.data).toBeDefined();
    });

    it('should handle invalid query type', async () => {
      const query: ZendeskQuery = {
        refId: 'A',
        queryType: 'invalid' as any,
      };

      const request = {
        targets: [query],
        range: {
          from: { valueOf: () => Date.now() - 86400000 },
          to: { valueOf: () => Date.now() },
        },
      } as any;

      const result = await dataSource.query(request).toPromise();
      expect(result).toBeDefined();
    });
  });

  describe('testDatasource', () => {
    it('should test datasource connection', async () => {
      const result = await dataSource.testDatasource();
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });
  });
});

