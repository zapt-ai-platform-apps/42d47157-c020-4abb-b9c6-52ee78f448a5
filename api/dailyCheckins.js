import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dailyCheckins } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq, and, desc } from 'drizzle-orm';

export default async function handler(req, res) {
  console.log(`Processing ${req.method} request to /api/dailyCheckins`);

  try {
    const user = await authenticateUser(req);
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // GET request - retrieve daily check-ins
    if (req.method === 'GET') {
      console.log(`Fetching daily check-ins for user: ${user.id}`);
      
      const { startDate, endDate } = req.query;
      let query = db.select()
        .from(dailyCheckins)
        .where(eq(dailyCheckins.userId, user.id))
        .orderBy(desc(dailyCheckins.date));
      
      if (startDate && endDate) {
        query = query.where(and(
          dailyCheckins.date >= new Date(startDate),
          dailyCheckins.date <= new Date(endDate)
        ));
      }
      
      const result = await query;
      
      console.log(`Found ${result.length} daily check-ins`);
      return res.status(200).json(result);
    }
    
    // POST request - create a new daily check-in
    if (req.method === 'POST') {
      const { date, overallFeeling, sleepQuality, energyLevel, mood, notes } = req.body;
      console.log(`Creating new daily check-in for user: ${user.id}, date: ${date}`);
      
      if (!date || !overallFeeling || !sleepQuality || !energyLevel || !mood) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if a check-in already exists for this date
      const existingCheckin = await db.select()
        .from(dailyCheckins)
        .where(and(
          eq(dailyCheckins.userId, user.id),
          eq(dailyCheckins.date, new Date(date))
        ));
      
      if (existingCheckin.length > 0) {
        return res.status(409).json({ 
          error: 'A check-in already exists for this date',
          existingCheckin: existingCheckin[0]
        });
      }
      
      const result = await db.insert(dailyCheckins)
        .values({
          userId: user.id,
          date: new Date(date),
          overallFeeling,
          sleepQuality,
          energyLevel,
          mood,
          notes,
        })
        .returning();

      console.log(`Created daily check-in with ID: ${result[0].id}`);
      return res.status(201).json(result[0]);
    }

    // PUT request - update a daily check-in
    if (req.method === 'PUT') {
      const { id, date, overallFeeling, sleepQuality, energyLevel, mood, notes } = req.body;
      console.log(`Updating daily check-in ID: ${id} for user: ${user.id}`);
      
      if (!id || !date || !overallFeeling || !sleepQuality || !energyLevel || !mood) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await db.update(dailyCheckins)
        .set({
          date: new Date(date),
          overallFeeling,
          sleepQuality,
          energyLevel,
          mood,
          notes,
        })
        .where(and(
          eq(dailyCheckins.id, id),
          eq(dailyCheckins.userId, user.id)
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Daily check-in not found or does not belong to user' });
      }

      console.log(`Updated daily check-in with ID: ${result[0].id}`);
      return res.status(200).json(result[0]);
    }

    // DELETE request - delete a daily check-in
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log(`Deleting daily check-in ID: ${id} for user: ${user.id}`);
      
      if (!id) {
        return res.status(400).json({ error: 'Missing daily check-in ID' });
      }

      const result = await db.delete(dailyCheckins)
        .where(and(
          eq(dailyCheckins.id, parseInt(id)),
          eq(dailyCheckins.userId, user.id)
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Daily check-in not found or does not belong to user' });
      }

      console.log(`Deleted daily check-in with ID: ${id}`);
      return res.status(200).json({ success: true });
    }

    // If we get here, the method is not supported
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in dailyCheckins API:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}