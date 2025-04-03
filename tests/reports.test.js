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
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    
    await handler(req, res);
    
    // Check that we logged appropriate warnings about precision issues
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Precision issue detected'));
    
    // Verify we tried to use the string directly as fallback
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Using string value directly'));
    
    // Ensure response was attempted with appropriate status code
    // Note: in our mocked environment, select returns an empty array,
    // so we should see a 404 response
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // Add more tests for other aspects of the reports API
});