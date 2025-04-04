import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import { reports } from '../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

// Mock modules
vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn()
}));

vi.mock('postgres', () => {
  return vi.fn(() => ({
    end: vi.fn()
  }));
});

vi.mock('../_apiUtils.js', () => ({
  authenticateUser: vi.fn(() => ({ id: 'test-user-id' }))
}));

vi.mock('../drizzle/schema.js', () => ({
  medications: { userId: 'user_id', endDate: { isNull: vi.fn() }, startDate: 'start_date' },
  sideEffects: { userId: 'user_id', medicationId: 'medication_id', date: 'date', createdAt: 'created_at' },
  dailyCheckins: { userId: 'user_id', date: 'date' },
  reports: { 
    id: 'id', 
    userId: 'user_id', 
    title: 'title', 
    startDate: 'start_date', 
    endDate: 'end_date', 
    createdAt: 'created_at' 
  }
}));

vi.mock('../_sentry.js', () => ({
  default: { captureException: vi.fn() }
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b, operator: 'eq' })),
  and: vi.fn((...conditions) => ({ conditions, operator: 'and' })),
  between: vi.fn((field, start, end) => ({ field, start, end, operator: 'between' })),
  desc: vi.fn(field => ({ field, direction: 'desc' })),
  or: vi.fn((...conditions) => ({ conditions, operator: 'or' }))
}));

vi.mock('../_dateUtils.js', () => ({
  formatDateForDB: vi.fn(date => date)
}));

describe('Reports API Handler', () => {
  let handler;
  let mockDB;
  let mockReq;
  let mockRes;

  beforeEach(async () => {
    // Import the handler fresh in each test to reset module state
    const module = await import('../api/reports.js');
    handler = module.default;

    // Setup mock DB
    mockDB = {
      select: vi.fn(() => mockDB),
      from: vi.fn(() => mockDB),
      where: vi.fn(() => mockDB),
      leftJoin: vi.fn(() => mockDB),
      orderBy: vi.fn(() => mockDB),
      limit: vi.fn(() => mockDB),
      insert: vi.fn(() => mockDB),
      values: vi.fn(() => mockDB),
      returning: vi.fn(() => [{ id: 'test-report-id', title: 'Test Report' }]),
      delete: vi.fn(() => mockDB)
    };

    drizzle.mockReturnValue(mockDB);

    // Setup mock request and response
    mockReq = {
      method: 'GET',
      query: {},
      body: {}
    };

    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn()
    };
  });

  it('should handle string IDs properly when fetching a report', async () => {
    // Setup
    const reportId = '1060536072299642900'; // Large ID that would lose precision as a number
    mockReq.query = { id: reportId, data: 'true' };
    
    // Mock report exists
    mockDB.where.mockImplementationOnce(() => {
      return {
        ...mockDB,
        // Simulate report exists for this user
        returning: vi.fn(() => [{ id: reportId, userId: 'test-user-id' }])
      };
    });
    
    // Setup expected report data
    const expectedReportData = {
      id: reportId,
      userId: 'test-user-id',
      title: 'Test Report',
      startDate: '2023-01-01',
      endDate: '2023-01-31'
    };
    
    // Mock the select to return our test report
    mockDB.select.mockImplementationOnce(() => {
      return {
        ...mockDB,
        from: vi.fn(() => ({
          ...mockDB,
          where: vi.fn(() => [expectedReportData])
        }))
      };
    });
    
    // Empty arrays for other data
    mockDB.select.mockImplementationOnce(() => ({
      ...mockDB,
      from: vi.fn(() => ({
        ...mockDB,
        where: vi.fn(() => ({
          ...mockDB,
          orderBy: vi.fn(() => [])
        }))
      }))
    }));
    
    mockDB.select.mockImplementationOnce(() => ({
      ...mockDB,
      from: vi.fn(() => ({
        ...mockDB,
        leftJoin: vi.fn(() => ({
          ...mockDB,
          where: vi.fn(() => ({
            ...mockDB,
            orderBy: vi.fn(() => [])
          }))
        }))
      }))
    }));
    
    mockDB.select.mockImplementationOnce(() => ({
      ...mockDB,
      from: vi.fn(() => ({
        ...mockDB,
        where: vi.fn(() => ({
          ...mockDB,
          orderBy: vi.fn(() => [])
        }))
      }))
    }));

    // Execute
    await handler(mockReq, mockRes);

    // Assert
    // Check if we used the correct string ID in our query
    expect(eq).toHaveBeenCalledWith(reports.id, reportId);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it('should handle non-existent reports gracefully', async () => {
    // Setup
    const reportId = '1060536072299642900';
    mockReq.query = { id: reportId, data: 'true' };
    
    // Mock empty results
    mockDB.select.mockImplementation(() => ({
      ...mockDB,
      from: vi.fn(() => ({
        ...mockDB,
        where: vi.fn(() => []) // Empty array = no report found
      }))
    }));

    // Execute
    await handler(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Report not found' });
  });
  
  it('should convert BigInt values to strings in the response', async () => {
    // Setup
    mockReq.method = 'GET';
    
    // Create a response with a BigInt
    const responseMock = [{ 
      id: BigInt('1060536072299642900'), 
      title: 'Test Report' 
    }];
    
    // Mock the database to return our response
    mockDB.select.mockImplementationOnce(() => ({
      ...mockDB,
      from: vi.fn(() => ({
        ...mockDB,
        where: vi.fn(() => ({
          ...mockDB,
          orderBy: vi.fn(() => responseMock)
        }))
      }))
    }));

    // Execute
    await handler(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(200);
    // JSON.stringify should have been called with an object where BigInt is converted to string
    expect(mockRes.json).toHaveBeenCalled();
    // Get the first argument passed to json
    const jsonArg = mockRes.json.mock.calls[0][0];
    // Expect id to be a string, not a BigInt
    expect(typeof jsonArg[0].id).toBe('string');
    expect(jsonArg[0].id).toBe('1060536072299642900');
  });

  it('should create a new report successfully', async () => {
    // Setup for POST request
    mockReq.method = 'POST';
    mockReq.body = {
      title: 'New Test Report',
      startDate: '2023-05-01',
      endDate: '2023-05-31'
    };
    
    // Mock successful insertion
    mockDB.insert.mockReturnValue(mockDB);
    mockDB.values.mockReturnValue(mockDB);
    mockDB.returning.mockReturnValue([{ 
      id: '1234567890',
      title: 'New Test Report',
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      userId: 'test-user-id'
    }]);

    // Execute
    await handler(mockReq, mockRes);

    // Assert
    expect(mockDB.insert).toHaveBeenCalledWith(reports);
    expect(mockDB.values).toHaveBeenCalledWith({
      userId: 'test-user-id',
      title: 'New Test Report',
      startDate: '2023-05-01',
      endDate: '2023-05-31'
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalled();
  });
});