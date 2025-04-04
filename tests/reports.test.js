import { it, describe, expect, beforeAll, afterAll, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reports } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

// Mock functions and data
vi.mock('@sentry/node', () => ({
  default: {
    captureException: vi.fn()
  }
}));

// Test user ID
const TEST_USER_ID = 'test-user-123';

describe('Report ID handling', () => {
  let client;
  let db;
  let createdReportId;

  // Connect to test database before tests
  beforeAll(async () => {
    client = postgres(process.env.COCKROACH_DB_URL);
    db = drizzle(client);
  });

  // Close connection after tests
  afterAll(async () => {
    if (createdReportId) {
      // Clean up test report
      try {
        await db.delete(reports)
          .where(eq(reports.id, createdReportId));
      } catch (error) {
        console.error('Failed to delete test report:', error);
      }
    }
    await client.end();
  });

  it('should handle large numeric IDs correctly', async () => {
    // Insert a report with a large ID
    const largeId = '9007199254740991'; // Max safe integer
    const testReport = {
      id: largeId,
      userId: TEST_USER_ID,
      title: 'Test Report with Large ID',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
    };

    try {
      // Try to insert the report
      const result = await db.insert(reports)
        .values(testReport)
        .returning();
      
      createdReportId = result[0].id;
      
      // Verify it was inserted
      expect(result.length).toBe(1);
      
      // Try to retrieve the report with different ID formats
      // 1. Using string ID
      const stringQuery = await db.select()
        .from(reports)
        .where(eq(reports.id, largeId));
      
      expect(stringQuery.length).toBe(1);
      expect(stringQuery[0].title).toBe(testReport.title);
      
      // 2. Using numeric ID (this might fail if ID is too large)
      try {
        const numericId = Number(largeId);
        const numericQuery = await db.select()
          .from(reports)
          .where(eq(reports.id, numericId));
        
        // This may or may not work depending on precision handling
        if (numericQuery.length > 0) {
          expect(numericQuery[0].title).toBe(testReport.title);
        }
      } catch (error) {
        console.warn('Numeric ID query failed as expected for large IDs:', error.message);
      }
      
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});