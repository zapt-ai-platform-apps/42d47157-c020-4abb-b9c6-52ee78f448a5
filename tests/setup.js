import { vi } from 'vitest';

// Make sure we have a proper mock for BigInt
export const BigInt = vi.fn((value) => {
  if (value === undefined || value === null) {
    throw new Error('Cannot convert undefined or null to BigInt');
  }
  
  // If the input is a Date, this would fail in real code
  if (value instanceof Date) {
    throw new TypeError('Cannot convert Date to BigInt');
  }
  
  // If the input is an object but not a Date
  if (typeof value === 'object' && value !== null) {
    throw new TypeError('Cannot convert object to BigInt');
  }
  
  // For valid inputs, return a mock value
  return 123456789n;
});

// Mock the global BigInt function
global.BigInt = BigInt;