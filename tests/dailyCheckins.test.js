import { describe, it, expect } from 'vitest';
import { formatDateForDB } from '../api/_dateUtils';

describe('Date Formatting Utilities', () => {
  it('should correctly format date strings', () => {
    // Standard date string
    expect(formatDateForDB('2023-05-15')).toBe('2023-05-15');
    
    // Date object
    const testDate = new Date('2023-05-15T12:00:00Z');
    expect(formatDateForDB(testDate)).toBe('2023-05-15');
    
    // Different date formats
    expect(formatDateForDB('May 15, 2023')).toBe('2023-05-15');
    
    // Invalid input
    expect(formatDateForDB(null)).toBe(null);
  });
});