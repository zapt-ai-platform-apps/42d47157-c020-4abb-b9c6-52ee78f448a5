import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sideEffects, medications } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq, and, desc } from 'drizzle-orm';

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

// Helper to validate and sanitize medication IDs
const validateMedicationId = (medicationId) => {
  console.log('Validating medication ID:', medicationId, 'Type:', typeof medicationId);
  
  // Check for Date objects or other objects
  if (medicationId instanceof Date || 
      (typeof medicationId === 'object' && medicationId !== null)) {
    
    // Check if it has toISOString method (characteristic of Date objects)
    if ('toISOString' in medicationId) {
      console.error('Invalid medication ID: Received a Date object:', medicationId);
      Sentry.captureException(new Error(`Date object received as medicationId: ${medicationId}`));
      return { isValid: false, error: 'Invalid medication ID format. Please select a valid medication.' };
    }
    
    // Log details about this object for debugging
    console.error('Invalid medication ID: Received an object instead of string/number:', 
                 JSON.stringify(medicationId), 
                 'Constructor:', medicationId.constructor ? medicationId.constructor.name : 'unknown');
    
    return { isValid: false, error: 'Invalid medication ID format. Please select a valid medication.' };
  }
  
  // Validate that it's a string or number
  if (typeof medicationId !== 'string' && typeof medicationId !== 'number') {
    console.error('Invalid medication ID type:', typeof medicationId);
    return { isValid: false, error: 'Invalid medication ID format. Please select a valid medication.' };
  }
  
  // Convert to string and validate
  const medIdStr = String(medicationId);
  
  // Check if it can be converted to a BigInt
  try {
    BigInt(medIdStr);
  } catch (err) {
    console.error('Failed to convert medication ID to BigInt:', err, 'Original value:', medicationId);
    Sentry.captureException(err);
    return { isValid: false, error: 'Invalid medication ID format. Please select a valid medication.' };
  }
  
  return { isValid: true, value: medIdStr };
};

export default async function handler(req, res) {
  console.log(`Processing ${req.method} request to /api/sideEffects`);

  // Define client outside the try block so it's available in the finally block
  let client = null;
  let db = null;

  try {
    const user = await authenticateUser(req);
    client = postgres(process.env.COCKROACH_DB_URL);
    db = drizzle(client);

    // GET request - retrieve side effects
    if (req.method === 'GET') {
      const { medicationId } = req.query;
      console.log(`Fetching side effects for user: ${user.id}${medicationId ? `, medication: ${medicationId}` : ''}`);
      
      let query = db.select({
        sideEffect: sideEffects,
        medicationName: medications.name
      })
        .from(sideEffects)
        .leftJoin(medications, eq(sideEffects.medicationId, medications.id))
        .where(eq(sideEffects.userId, user.id))
        .orderBy(desc(sideEffects.date), desc(sideEffects.createdAt));
      
      if (medicationId) {
        // Validate medication ID before using it in the query
        const validation = validateMedicationId(medicationId);
        if (!validation.isValid) {
          return res.status(400).json({ error: validation.error });
        }
        
        // Use BigInt to ensure proper comparison with the BIGINT column
        query = query.where(eq(sideEffects.medicationId, BigInt(validation.value)));
      }
      
      const result = await query;
      
      // Transform the result to a more convenient format
      const formattedResult = result.map(row => ({
        ...row.sideEffect,
        medicationName: row.medicationName
      }));
      
      console.log(`Found ${formattedResult.length} side effects`);
      return res.status(200).json(formattedResult);
    }
    
    // POST request - create a new side effect
    if (req.method === 'POST') {
      const { medicationId, symptom, severity, timeOfDay, date, notes } = req.body;
      console.log(`Creating new side effect: ${symptom} for user: ${user.id}, medication:`, medicationId);
      console.log('Medication ID type:', typeof medicationId, 'Value:', medicationId);
      console.log('Date type:', typeof date, 'Value:', date);
      
      if (!medicationId || !symptom || !severity || !timeOfDay || !date) {
        console.error('Missing required fields:', { medicationId, symptom, severity, timeOfDay, date });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate medicationId
      const validation = validateMedicationId(medicationId);
      if (!validation.isValid) {
        console.error('Medication ID validation failed:', validation.error);
        return res.status(400).json({ error: validation.error });
      }
      
      const medIdStr = validation.value;
      console.log(`Processing medication ID as string: ${medIdStr}`);
      
      // Ensure date is properly formatted as string
      let formattedDate;
      try {
        formattedDate = ensureDateString(date);
        console.log(`Formatted date: ${formattedDate}`);
      } catch (error) {
        console.error('Error formatting date:', error);
        return res.status(400).json({ error: `Invalid date format: ${error.message}` });
      }
      
      // Use database query with properly typed BigInt
      const medResult = await db.select()
        .from(medications)
        .where(and(
          eq(medications.id, BigInt(medIdStr)),
          eq(medications.userId, user.id)
        ));
      
      console.log(`Found ${medResult.length} matching medications`);
      
      if (medResult.length === 0) {
        return res.status(404).json({ error: 'Medication not found or does not belong to user' });
      }
      
      // Use the verified medication ID as BigInt and formatted date string
      const result = await db.insert(sideEffects)
        .values({
          userId: user.id,
          medicationId: BigInt(medIdStr),
          symptom,
          severity,
          timeOfDay,
          date: formattedDate, // Use the formatted date string
          notes,
        })
        .returning();

      console.log(`Created side effect with ID: ${result[0].id}`);
      return res.status(201).json(result[0]);
    }

    // PUT request - update a side effect
    if (req.method === 'PUT') {
      const { id, medicationId, symptom, severity, timeOfDay, date, notes } = req.body;
      console.log(`Updating side effect ID: ${id} for user: ${user.id}`);
      console.log('Medication ID type:', typeof medicationId, 'Value:', medicationId);
      console.log('Date type:', typeof date, 'Value:', date);
      
      if (!id || !medicationId || !symptom || !severity || !timeOfDay || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate medicationId
      const validation = validateMedicationId(medicationId);
      if (!validation.isValid) {
        console.error('Medication ID validation failed:', validation.error);
        return res.status(400).json({ error: validation.error });
      }
      
      const medIdStr = validation.value;
      
      // Ensure date is properly formatted as string
      let formattedDate;
      try {
        formattedDate = ensureDateString(date);
        console.log(`Formatted date: ${formattedDate}`);
      } catch (error) {
        console.error('Error formatting date:', error);
        return res.status(400).json({ error: `Invalid date format: ${error.message}` });
      }
      
      // Verify medication belongs to user using properly typed BigInt
      const medResult = await db.select()
        .from(medications)
        .where(and(
          eq(medications.id, BigInt(medIdStr)),
          eq(medications.userId, user.id)
        ));
      
      if (medResult.length === 0) {
        return res.status(404).json({ error: 'Medication not found or does not belong to user' });
      }
      
      // Verify side effect belongs to user
      const existingSideEffect = await db.select()
        .from(sideEffects)
        .where(and(
          eq(sideEffects.id, id),
          eq(sideEffects.userId, user.id)
        ));
      
      if (existingSideEffect.length === 0) {
        return res.status(404).json({ error: 'Side effect not found or does not belong to user' });
      }
      
      const result = await db.update(sideEffects)
        .set({
          medicationId: BigInt(medIdStr),
          symptom,
          severity,
          timeOfDay,
          date: formattedDate, // Use the formatted date string
          notes,
          // FIX: Use Date object instead of string for updatedAt
          updatedAt: new Date(),
        })
        .where(eq(sideEffects.id, id))
        .returning();

      console.log(`Updated side effect with ID: ${result[0].id}`);
      return res.status(200).json(result[0]);
    }

    // DELETE request - delete a side effect
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log(`Deleting side effect ID: ${id} for user: ${user.id}`);
      
      if (!id) {
        return res.status(400).json({ error: 'Missing side effect ID' });
      }

      const result = await db.delete(sideEffects)
        .where(and(
          eq(sideEffects.id, parseInt(id)),
          eq(sideEffects.userId, user.id)
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Side effect not found or does not belong to user' });
      }

      console.log(`Deleted side effect with ID: ${id}`);
      return res.status(200).json({ success: true });
    }

    // If we get here, the method is not supported
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in sideEffects API:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Close the database connection
    if (client) {
      await client.end();
    }
  }
}