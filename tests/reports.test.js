import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the necessary modules and functions
vi.mock('../drizzle/schema.js', () => ({
  medications: { userId: {}, startDate: {}, endDate: {} },
  sideEffects: { userId: {}, date: {}, createdAt: {} },
  dailyCheckins: { userId: {}, date: {} },
  reports: { id: {}, userId: {}, createdAt: {} }
}));

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn(() => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => []),
          limit: vi.fn(() => [])
        })),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => [])
          }))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: '123' }])
      }))
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => [{ id: '123' }])
      }))
    }))
  }))
}));

vi.mock('postgres', () => {
  return {
    default: vi.fn(() => ({
      end: vi.fn()
    }))
  };
});

vi.mock('../api/_apiUtils.js', () => ({
  authenticateUser: vi.fn(() => ({ id: 'user-123' }))
}));

vi.mock('../api/_sentry.js', () => ({
  default: {
    captureException: vi.fn()
  }
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  between: vi.fn(),
  desc: vi.fn(),
  or: vi.fn()
}));

import handler from '../api/reports.js';

describe('Reports API Handler', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      method: 'GET',
      query: {},
      headers: {}
    };
    
    res = {
      status: vi.fn(() => res),
      json: vi.fn()
    };
    
    // Reset console mocks
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('handles large report IDs correctly', async () => {
    // Set up a very large ID that exceeds JavaScript's MAX_SAFE_INTEGER
    const largeId = '1060536072299642891';
    req.query = { id: largeId, data: 'true' };
    
    // Add BigInt to global if needed for test environment
    if (typeof global.BigInt === 'undefined') {
      global.BigInt = (n) => Number(n);
    }
    
    // Spy on console
    const consoleLogSpy = vi.spyOn(console, 'log');
    
    await handler(req, res);
    
    // Verify we used the string directly
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Using string value directly for report ID'));
    
    // Ensure we tried to query with the string ID
    // Note: since our mock returns empty, we expect a 404
    expect(res.status).toHaveBeenCalledWith(404);
  });
  
  it('handles valid report ID format but non-existent report', async () => {
    req.query = { id: '123', data: 'true' };
    
    await handler(req, res);
    
    // Our mock returns empty array, so should get 404
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Report not found' });
  });
  
  it('rejects invalid report ID format', async () => {
    req.query = { id: 'not-a-number', data: 'true' };
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid report ID format' });
  });

  // Add more tests for other aspects of the reports API
});