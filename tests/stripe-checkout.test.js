import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockRequest, createMockResponse } from './mocks/httpMocks';
import subscriptionsHandler from '../api/subscriptions';

// Mock external dependencies
vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn(() => ({
    // Mock any database operations you need
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
  userReportsCount: {}
}));

vi.mock('./_apiUtils.js', () => ({
  authenticateUser: vi.fn(() => ({ id: 'mock-user-id', email: 'user@example.com' }))
}), { virtual: true });

vi.mock('./_sentry.js', () => ({
  default: {
    captureException: vi.fn()
  }
}), { virtual: true });

vi.mock('stripe', () => {
  const MockStripe = vi.fn();
  MockStripe.prototype.checkout = {
    sessions: {
      create: vi.fn(async () => ({
        id: 'mock-session-id',
        url: 'https://checkout.stripe.com/mock-session'
      }))
    }
  };
  MockStripe.prototype.customers = {
    list: vi.fn(async () => ({ data: [] }))
  };
  return { default: MockStripe };
});

// Mock environment variables
beforeEach(() => {
  process.env.STRIPE_API_KEY = 'mock-stripe-key';
  process.env.STRIPE_API_KEY_CHECKOUTS = 'mock-stripe-checkouts-key';
  process.env.COCKROACH_DB_URL = 'mock-db-url';
});

// Clean up
afterEach(() => {
  vi.clearAllMocks();
});

describe('Stripe Checkout with Multiple Currencies', () => {
  it('creates a checkout session with GBP currency', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        currency: 'GBP',
        returnUrl: 'https://example.com/success'
      }
    });
    
    const res = createMockResponse();
    
    await subscriptionsHandler(req, res);
    
    // Get reference to the mocked create function
    const createSessionFn = new (require('stripe').default)().checkout.sessions.create;
    
    // Verify that create was called with the right parameters
    expect(createSessionFn).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: 'gbp', // Lowercase as per Stripe requirements
        line_items: [
          expect.objectContaining({
            price: expect.any(String), // Single price ID
            quantity: 1
          })
        ],
        subscription_data: {
          application_fee_percent: 30
        }
      }),
      expect.objectContaining({
        stripeAccount: 'acct_1RBjPHB1e4Ppxoh0'
      })
    );
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 'mock-session-id',
      url: 'https://checkout.stripe.com/mock-session'
    });
  });
  
  it('creates a checkout session with USD currency', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        currency: 'USD',
        returnUrl: 'https://example.com/success'
      }
    });
    
    const res = createMockResponse();
    
    await subscriptionsHandler(req, res);
    
    // Get reference to the mocked create function
    const createSessionFn = new (require('stripe').default)().checkout.sessions.create;
    
    // Verify that create was called with the right parameters
    expect(createSessionFn).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: 'usd', // Lowercase as per Stripe requirements
        line_items: [
          expect.objectContaining({
            price: expect.any(String), // Single price ID
            quantity: 1
          })
        ]
      }),
      expect.any(Object)
    );
    
    expect(res.status).toHaveBeenCalledWith(200);
  });
  
  it('rejects invalid currencies', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        currency: 'INVALID',
        returnUrl: 'https://example.com/success'
      }
    });
    
    const res = createMockResponse();
    
    await subscriptionsHandler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid currency. Please choose GBP or USD.'
    });
  });
});