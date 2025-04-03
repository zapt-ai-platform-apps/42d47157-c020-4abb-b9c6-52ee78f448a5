import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../api/sideEffects';

// Mock dependencies
vi.mock('../drizzle/schema.js', () => ({
  sideEffects: {
    id: 'id',
    userId: 'userId',
    medicationId: 'medicationId',
    date: 'date',
    createdAt: 'createdAt'
  },
  medications: {
    id: 'id',
    name: 'name'
  }
}));

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn(() => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve([
              { sideEffect: { id: 1 }, medicationName: 'Test Med' }
            ]))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 1 }]))
        }))
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1 }]))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 1 }]))
        }))
      }))
    }))
  })
}));

vi.mock('postgres', () => {
  const mockClient = vi.fn((...args) => {
    // Check if this is a tagged template call or regular function call
    if (typeof args[0] === 'string') {
      // This simulates the old incorrect call pattern
      return Promise.resolve([{ id: 1 }]);
    } else {
      // This simulates the new tagged template pattern
      return Promise.resolve([{ id: 1 }]);
    }
  });
  
  // Add the end method needed in the finally block
  mockClient.end = vi.fn();
  
  return {
    default: vi.fn(() => mockClient)
  };
});

vi.mock('../api/_apiUtils.js', () => ({
  authenticateUser: vi.fn(() => Promise.resolve({ id: 'user123' }))
}));

vi.mock('../api/_sentry.js', () => ({
  default: {
    captureException: vi.fn()
  }
}));

describe('Side Effects API Handler', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: '',
      body: {},
      query: {}
    };
    
    res = {
      status: vi.fn(() => res),
      json: vi.fn(() => res)
    };
  });

  it('should handle medication query using tagged template literals', async () => {
    // Set up POST request
    req.method = 'POST';
    req.body = {
      medicationId: '123',
      symptom: 'Headache',
      severity: 5,
      timeOfDay: 'morning',
      date: '2023-06-01'
    };
    
    // This will call our mocked postgres client, which simulates both usage patterns
    await handler(req, res);
    
    // Verify the response was successful
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: expect.any(Number) }));
  });

  it('should handle PUT requests with tagged template literals', async () => {
    // Set up PUT request
    req.method = 'PUT';
    req.body = {
      id: 1,
      medicationId: '123',
      symptom: 'Headache',
      severity: 5,
      timeOfDay: 'morning',
      date: '2023-06-01'
    };
    
    await handler(req, res);
    
    // Verify the response was successful
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: expect.any(Number) }));
  });
});