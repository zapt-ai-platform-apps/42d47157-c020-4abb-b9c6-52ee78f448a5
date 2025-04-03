import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sideEffects, medications } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq, and, desc, sql } from 'drizzle-orm';

export default async function handler(req, res) {
  console.log(`Processing ${req.method} request to /api/sideEffects`);

  try {
    const user = await authenticateUser(req);
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

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
        query = query.where(eq(sideEffects.medicationId, parseInt(medicationId)));
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
      console.log(`Creating new side effect: ${symptom} for user: ${user.id}, medication: ${medicationId}`);
      
      if (!medicationId || !symptom || !severity || !timeOfDay || !date) {
        console.error('Missing required fields:', { medicationId, symptom, severity, timeOfDay, date });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Ensure medicationId is a number
      const medId = Number(medicationId);
      if (isNaN(medId)) {
        console.error('Invalid medication ID format:', medicationId);
        return res.status(400).json({ error: 'Invalid medication ID format' });
      }

      console.log(`Verifying medication ID ${medId} belongs to user ${user.id}`);
      
      // Verify medication belongs to user
      const med = await db.select()
        .from(medications)
        .where(and(
          eq(medications.id, medId),
          eq(medications.userId, user.id)
        ));
      
      console.log(`Found ${med.length} matching medications`);
      
      if (med.length === 0) {
        return res.status(404).json({ error: 'Medication not found or does not belong to user' });
      }
      
      const result = await db.insert(sideEffects)
        .values({
          userId: user.id,
          medicationId: medId,
          symptom,
          severity,
          timeOfDay,
          date: new Date(date),
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
      
      if (!id || !medicationId || !symptom || !severity || !timeOfDay || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Ensure medicationId is a number
      const medId = Number(medicationId);
      if (isNaN(medId)) {
        return res.status(400).json({ error: 'Invalid medication ID format' });
      }

      // Verify medication belongs to user
      const med = await db.select()
        .from(medications)
        .where(and(
          eq(medications.id, medId),
          eq(medications.userId, user.id)
        ));
      
      if (med.length === 0) {
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
          medicationId: medId,
          symptom,
          severity,
          timeOfDay,
          date: new Date(date),
          notes,
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