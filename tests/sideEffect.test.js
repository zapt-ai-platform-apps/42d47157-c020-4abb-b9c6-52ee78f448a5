import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BigInt } from './setup';

// Mock the dependencies
vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }))
}));

vi.mock('postgres', () => {
  return {
    default: vi.fn(() => ({
      end: vi.fn()
    }))
  };
});

vi.mock('../drizzle/schema.js', () => ({
  sideEffects: { id: 'id', userId: 'userId', medicationId: 'medicationId', date: 'date', createdAt: 'createdAt' },
  medications: { id: 'id', name: 'name' }
}));

vi.mock('./_apiUtils.js', () => ({
  authenticateUser: vi.fn(() => ({ id: 'user123' }))
}));

vi.mock('./_sentry.js', () => ({
  default: { captureException: vi.fn() }
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  desc: vi.fn()
}));

// Import the handler after mocking dependencies
let handler;

describe('Side Effects API Handler', () => {
  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Import the handler dynamically to ensure it uses the mocked dependencies
    const module = await import('../api/sideEffects.js');
    handler = module.default;
  });

  it('should correctly convert medication ID to BigInt when creating a side effect', async () => {
    // Arrange
    const req = {
      method: 'POST',
      body: {
        medicationId: '1060514617554862091', // Large ID that would overflow an INTEGER
        symptom: 'Headache',
        severity: 5,
        timeOfDay: 'Morning',
        date: '2023-05-15',
        notes: 'Test notes'
      }
    };
    
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    // Mock the database select to return a medication
    const db = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 1 }])
    };

    // Act
    await handler(req, res);

    // Assert
    // Verify that BigInt was used to handle the large ID
    expect(BigInt).toHaveBeenCalledWith('1060514617554862091');
    expect(res.status).toHaveBeenCalledWith(201);
  });
});