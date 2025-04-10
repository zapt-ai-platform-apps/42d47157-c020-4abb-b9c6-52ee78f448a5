import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { medications } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  console.log(`Processing ${req.method} request to /api/medications`);

  let client = null;

  try {
    const user = await authenticateUser(req);
    client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // GET request - retrieve medications
    if (req.method === 'GET') {
      console.log(`Fetching medications for user: ${user.id}`);
      const result = await db.select()
        .from(medications)
        .where(eq(medications.userId, user.id))
        .orderBy(medications.createdAt);

      // Log medication IDs to help with debugging
      console.log(`Found ${result.length} medications with IDs: ${result.map(med => med.id).join(', ')}`);
      return res.status(200).json(result);
    }
    
    // POST request - create a new medication
    if (req.method === 'POST') {
      const { name, dosage, frequency, startDate, endDate, notes } = req.body;
      console.log(`Creating new medication: ${name} for user: ${user.id}`);
      
      if (!name || !dosage || !frequency || !startDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Ensure dates are properly formatted as strings
      const formattedStartDate = ensureDateString(startDate);
      const formattedEndDate = endDate ? ensureDateString(endDate) : null;

      const result = await db.insert(medications)
        .values({
          userId: user.id,
          name,
          dosage,
          frequency,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          notes,
        })
        .returning();

      console.log(`Created medication with ID: ${result[0].id}`);
      return res.status(201).json(result[0]);
    }

    // PUT request - update a medication
    if (req.method === 'PUT') {
      const { id, name, dosage, frequency, startDate, endDate, notes } = req.body;
      console.log(`Updating medication ID: ${id} for user: ${user.id}`);
      
      if (!id || !name || !dosage || !frequency || !startDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Ensure dates are properly formatted as strings
      const formattedStartDate = ensureDateString(startDate);
      const formattedEndDate = endDate ? ensureDateString(endDate) : null;

      // FIX: Use Date object instead of string for updatedAt
      const now = new Date();

      const result = await db.update(medications)
        .set({
          name,
          dosage,
          frequency,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          notes,
          updatedAt: now,
        })
        .where(eq(medications.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      console.log(`Updated medication with ID: ${result[0].id}`);
      return res.status(200).json(result[0]);
    }

    // DELETE request - delete a medication
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log(`Deleting medication ID: ${id} for user: ${user.id}`);
      
      if (!id) {
        return res.status(400).json({ error: 'Missing medication ID' });
      }

      const result = await db.delete(medications)
        .where(eq(medications.id, parseInt(id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      console.log(`Deleted medication with ID: ${id}`);
      return res.status(200).json({ success: true });
    }

    // If we get here, the method is not supported
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in medications API:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.end();
    }
  }
}

/**
 * Ensures a date value is properly formatted as a string
 * Handles both Date objects and string inputs
 * 
 * @param {Date|string} date - The date to format
 * @returns {string} The date formatted as a string in YYYY-MM-DD format
 */
function ensureDateString(date) {
  if (date instanceof Date) {
    // If it's a Date object, convert to ISO string and take just the YYYY-MM-DD part
    return date.toISOString().split('T')[0];
  } else if (typeof date === 'string') {
    // If it's already a string, make sure it's in the right format
    // Try to create a Date object and convert back to ensure consistent format
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        // Invalid date string
        throw new Error(`Invalid date string: ${date}`);
      }
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error(`Error formatting date string: ${date}`, error);
      // Return the original string if we can't parse it
      // The database will reject it if it's in the wrong format
      return date;
    }
  } else {
    // If it's neither a Date nor a string, throw an error
    throw new Error(`Date must be a Date object or string, received: ${typeof date}`);
  }
}