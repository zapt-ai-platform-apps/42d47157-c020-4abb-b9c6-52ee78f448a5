import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the imported modules
vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn(),
}));

vi.mock('postgres', () => {
  return {
    default: vi.fn(() => ({
      end: vi.fn(),
    })),
  };
});

vi.mock('../api/_apiUtils.js', () => ({
  authenticateUser: vi.fn(),
}));

vi.mock('../api/_sentry.js', () => ({
  default: {
    captureException: vi.fn(),
  },
}));

vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      customers: {
        list: vi.fn().mockResolvedValue({ data: [] }),
      },
      subscriptions: {
        list: vi.fn().mockResolvedValue({ data: [] }),
      },
    })),
  };
});

vi.mock('../drizzle/schema.js', () => ({
  medications: { userId: 'user_id' },
  sideEffects: { userId: 'user_id' },
  dailyCheckins: { userId: 'user_id' },
  reports: { 
    id: 'report_id',
    userId: 'user_id',
    createdAt: 'created_at',
  },
  userReportsCount: {
    userId: 'user_id',
    count: 'count',
    updatedAt: 'updated_at',
  }
}));

// Import the handler
const handlerPath = '../api/reports.js';
let handler;

describe('Report Count Management', () => {
  beforeEach(async () => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Re-import to get fresh handler with our mocks
    vi.resetModules();
    const module = await import(handlerPath);
    handler = module.default;
  });

  it('properly updates report count when creating a report', async () => {
    // Setup mocks
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    const mockReq = {
      method: 'POST',
      body: {
        title: 'Test Report',
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      },
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Mock database operations
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: '12345' }]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };
    
    // Mock drizzle to return mockDb
    const { drizzle } = await import('drizzle-orm/postgres-js');
    drizzle.mockReturnValue(mockDb);
    
    // Mock authenticateUser to return mockUser
    const { authenticateUser } = await import('../api/_apiUtils.js');
    authenticateUser.mockResolvedValue(mockUser);

    // Mock the count check to return 0 reports (allowing new report creation)
    mockDb.where.mockImplementationOnce(() => []); // No existing count record for checkReportLimit
    
    // Mock insert for creating a new count record
    mockDb.insert.mockReturnValueOnce(mockDb);
    mockDb.values.mockReturnValueOnce(mockDb);
    
    // Mock the report insertion
    mockDb.insert.mockReturnValueOnce(mockDb);
    mockDb.values.mockReturnValueOnce(mockDb);
    mockDb.returning.mockResolvedValueOnce([{ id: '12345' }]);
    
    // Mock the count record check for incrementReportCount
    mockDb.where.mockImplementationOnce(() => []); // No existing count record
    
    // Mock the insert for creating a count record with count=1
    mockDb.insert.mockReturnValueOnce(mockDb);
    mockDb.values.mockReturnValueOnce(mockDb);
    mockDb.returning.mockResolvedValueOnce([{ userId: 'test-user-id', count: 1 }]);
    
    // Mock verification select
    mockDb.where.mockImplementationOnce(() => [{ userId: 'test-user-id', count: 1 }]);
    
    // Call the handler
    await handler(mockReq, mockRes);
    
    // Verify the response
    expect(mockRes.status).toHaveBeenCalledWith(201);
    
    // Verify that incrementReportCount was called by checking insert/update operations
    expect(mockDb.insert).toHaveBeenCalledTimes(3); // Initial count check, report creation, count increment
    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'test-user-id',
      count: 1
    }));
  });

  it('updates report count correctly when a user already has reports', async () => {
    // Setup mocks
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    const mockReq = {
      method: 'POST',
      body: {
        title: 'Test Report',
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      },
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Mock database operations
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: '12345' }]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };
    
    // Mock drizzle to return mockDb
    const { drizzle } = await import('drizzle-orm/postgres-js');
    drizzle.mockReturnValue(mockDb);
    
    // Mock authenticateUser to return mockUser
    const { authenticateUser } = await import('../api/_apiUtils.js');
    authenticateUser.mockResolvedValue(mockUser);

    // Mock the count check to return 1 existing report
    mockDb.where.mockImplementationOnce(() => [{
      userId: 'test-user-id',
      count: 1
    }]); 
    
    // Mock the report insertion
    mockDb.insert.mockReturnValueOnce(mockDb);
    mockDb.values.mockReturnValueOnce(mockDb);
    mockDb.returning.mockResolvedValueOnce([{ id: '12345' }]);
    
    // Mock the count record check for incrementReportCount
    mockDb.where.mockImplementationOnce(() => [{
      userId: 'test-user-id',
      count: 1
    }]);
    
    // Mock the update for incrementing the count
    mockDb.update.mockReturnValueOnce(mockDb);
    mockDb.set.mockReturnValueOnce(mockDb);
    mockDb.where.mockReturnValueOnce(mockDb);
    mockDb.returning.mockResolvedValueOnce([{ userId: 'test-user-id', count: 2 }]);
    
    // Mock verification select
    mockDb.where.mockImplementationOnce(() => [{ userId: 'test-user-id', count: 2 }]);
    
    // Call the handler
    await handler(mockReq, mockRes);
    
    // Verify the response
    expect(mockRes.status).toHaveBeenCalledWith(201);
    
    // Verify that incrementReportCount was called and updated the existing count
    expect(mockDb.update).toHaveBeenCalledTimes(1);
    expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
      count: 2,
      updatedAt: expect.any(Date)
    }));
  });
  
  it('decreases the report count when a report is deleted', async () => {
    // Setup mocks
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    const mockReq = {
      method: 'DELETE',
      query: { id: '12345' },
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Mock database operations
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };
    
    // Mock drizzle to return mockDb
    const { drizzle } = await import('drizzle-orm/postgres-js');
    drizzle.mockReturnValue(mockDb);
    
    // Mock authenticateUser to return mockUser
    const { authenticateUser } = await import('../api/_apiUtils.js');
    authenticateUser.mockResolvedValue(mockUser);

    // Mock the report deletion
    mockDb.delete.mockReturnValueOnce(mockDb);
    mockDb.where.mockReturnValueOnce(mockDb);
    mockDb.returning.mockResolvedValueOnce([{ id: '12345' }]);
    
    // Mock the count record check
    mockDb.where.mockImplementationOnce(() => [{
      userId: 'test-user-id',
      count: 2
    }]);
    
    // Mock the update for decrementing the count
    mockDb.update.mockReturnValueOnce(mockDb);
    mockDb.set.mockReturnValueOnce(mockDb);
    mockDb.where.mockReturnValueOnce(mockDb);
    
    // Call the handler
    await handler(mockReq, mockRes);
    
    // Verify the response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    
    // Verify that the count was decremented
    expect(mockDb.update).toHaveBeenCalledTimes(1);
    expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
      count: 1,
      updatedAt: expect.any(Date)
    }));
  });
});