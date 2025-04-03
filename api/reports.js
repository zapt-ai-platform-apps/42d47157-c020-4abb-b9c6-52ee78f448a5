import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { medications, sideEffects, dailyCheckins, reports } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq, and, between, desc, or } from 'drizzle-orm';
import { formatDateForDB } from './_dateUtils.js';

export default async function handler(req, res) {
  console.log(`Processing ${req.method} request to /api/reports`);
  
  // Declare client outside try block so it's accessible in finally
  let client = null;

  try {
    const user = await authenticateUser(req);
    client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // GET request - retrieve all reports or a specific report data
    if (req.method === 'GET') {
      const { id, data } = req.query;
      
      // If data=true, return the full report data for the given ID
      if (id && data === 'true') {
        console.log(`Fetching full report data for report ID: ${id}`);
        console.log(`Report ID type: ${typeof id}, value: ${id}`);
        
        let reportId;
        try {
          // For large IDs, just validate the format without conversion
          BigInt(id); // This validates it's a valid numeric string
          
          // Use the string ID directly to avoid any precision loss
          reportId = id;
          console.log(`Using string value directly for report ID: ${reportId}`);
        } catch (error) {
          console.error(`Error parsing report ID: ${id}`, error);
          Sentry.captureException(error);
          return res.status(400).json({ error: 'Invalid report ID format' });
        }

        // Get the report details
        const reportDetails = await db.select()
          .from(reports)
          .where(and(
            eq(reports.id, reportId),
            eq(reports.userId, user.id)
          ));
        
        console.log(`Query returned ${reportDetails.length} reports for ID: ${reportId}`);

        if (reportDetails.length === 0) {
          console.log(`No report found with ID ${reportId} for user ${user.id}`);
          return res.status(404).json({ error: 'Report not found' });
        }

        const report = reportDetails[0];
        const { startDate, endDate } = report;

        // Get medications active during the report period
        const medicationsList = await db.select()
          .from(medications)
          .where(and(
            eq(medications.userId, user.id),
            or(
              medications.endDate.isNull(),
              medications.endDate >= startDate
            ),
            medications.startDate <= endDate
          ))
          .orderBy(medications.startDate);

        // Get side effects during the report period
        const sideEffectsList = await db.select({
          sideEffect: sideEffects,
          medicationName: medications.name
        })
          .from(sideEffects)
          .leftJoin(medications, eq(sideEffects.medicationId, medications.id))
          .where(and(
            eq(sideEffects.userId, user.id),
            between(sideEffects.date, startDate, endDate)
          ))
          .orderBy(sideEffects.date, sideEffects.createdAt);

        // Get daily check-ins during the report period
        const checkinsList = await db.select()
          .from(dailyCheckins)
          .where(and(
            eq(dailyCheckins.userId, user.id),
            between(dailyCheckins.date, startDate, endDate)
          ))
          .orderBy(dailyCheckins.date);

        // Format side effects
        const formattedSideEffects = sideEffectsList.map(row => ({
          ...row.sideEffect,
          medicationName: row.medicationName
        }));

        console.log(`Successfully assembled report data for ID: ${reportId}`);
        return res.status(200).json({
          report,
          medications: medicationsList,
          sideEffects: formattedSideEffects,
          checkins: checkinsList
        });
      }
      
      // Otherwise return the list of reports
      console.log(`Fetching reports list for user: ${user.id}`);
      const result = await db.select()
        .from(reports)
        .where(eq(reports.userId, user.id))
        .orderBy(desc(reports.createdAt));
      
      console.log(`Found ${result.length} reports`);
      return res.status(200).json(result);
    }
    
    // POST request - create a new report
    if (req.method === 'POST') {
      const { title, startDate, endDate } = req.body;
      console.log(`Creating new report: ${title} for user: ${user.id}`);
      
      if (!title || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await db.insert(reports)
        .values({
          userId: user.id,
          title,
          startDate: formatDateForDB(startDate),
          endDate: formatDateForDB(endDate),
        })
        .returning();

      console.log(`Created report with ID: ${result[0].id}`);
      return res.status(201).json(result[0]);
    }

    // DELETE request - delete a report
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log(`Deleting report ID: ${id} (type: ${typeof id}) for user: ${user.id}`);
      
      if (!id) {
        return res.status(400).json({ error: 'Missing report ID' });
      }

      try {
        // Use string ID directly to avoid precision issues
        let reportId;
        try {
          // Just validate the format
          BigInt(id);
          reportId = id; // Use string directly
          console.log(`Using string directly for report ID: ${reportId}`);
        } catch (error) {
          console.error(`Error parsing report ID: ${id}`, error);
          return res.status(400).json({ error: 'Invalid report ID format' });
        }

        // Attempt to delete the report
        const result = await db.delete(reports)
          .where(and(
            eq(reports.id, reportId),
            eq(reports.userId, user.id)
          ))
          .returning();

        console.log(`Delete operation returned ${result.length} rows`);
        
        if (result.length === 0) {
          console.log(`No report found with ID ${reportId} for user ${user.id}`);
          return res.status(404).json({ error: 'Report not found or does not belong to user' });
        }

        console.log(`Successfully deleted report with ID: ${reportId}`);
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error(`Error deleting report with ID ${id}:`, error);
        Sentry.captureException(error);
        return res.status(500).json({ error: `Failed to delete report: ${error.message}` });
      }
    }

    // If we get here, the method is not supported
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in reports API:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Make sure to close the postgres client
    try {
      await client?.end();
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
  }
}