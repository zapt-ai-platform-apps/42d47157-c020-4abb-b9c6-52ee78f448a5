import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { medications, sideEffects, dailyCheckins, reports, userReportsCount } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq, and, between, desc, or, isNull } from 'drizzle-orm';
import { formatDateForDB } from './_dateUtils.js';
import Stripe from 'stripe';

/**
 * Recursively converts any BigInt values to strings in an object
 * @param {any} data - The data to process
 * @returns {any} - The processed data with BigInt values converted to strings
 */
export function convertBigIntToString(data) {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'bigint') {
    return data.toString();
  }
  
  // Add a check for Date objects to prevent them from being converted to empty objects
  if (data instanceof Date) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertBigIntToString(item));
  }
  
  if (typeof data === 'object') {
    const result = {};
    for (const key in data) {
      result[key] = convertBigIntToString(data[key]);
    }
    return result;
  }
  
  return data;
}

/**
 * Ensures value is either a valid date string or a Date object
 * Prevents toISOString errors by handling non-Date objects
 * @param {any} dateValue - Value to validate as a date
 * @returns {string|null} A date string in YYYY-MM-DD format or null
 */
function ensureDateString(dateValue) {
  if (!dateValue) return null;
  
  // If it's already a date string in YYYY-MM-DD format, return it as is
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateValue;
  }
  
  // Handle Date objects or convert to Date
  try {
    let date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      date = new Date(dateValue);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error(`Invalid date value: ${dateValue}`);
        throw new Error(`Invalid date value: ${dateValue}`);
      }
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error(`Error formatting date value: ${dateValue}`, error);
    Sentry.captureException(error);
    // Return null for invalid dates instead of letting it propagate as something that's not a Date
    return null;
  }
}

// Check if user has reached free report limit and has no active subscription
async function checkReportLimit(db, userId, userEmail) {
  try {
    if (!userEmail) {
      throw new Error('User email not available');
    }
    
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_API_KEY);
    
    // Search for a customer in Stripe by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });
    
    let hasActiveSubscription = false;
    
    // If customer exists, check for active subscriptions
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });
      
      hasActiveSubscription = subscriptions.data.length > 0;
    }
    
    // If user has an active subscription, they can create unlimited reports
    if (hasActiveSubscription) {
      return { canCreateReport: true, hasActiveSubscription, reportsCreated: 0 };
    }
  
    // Check how many reports the user has created
    let userReportCount = await db.select()
      .from(userReportsCount)
      .where(eq(userReportsCount.userId, userId));
    
    let reportsCreated = 0;
    
    if (userReportCount.length === 0) {
      // User hasn't created any reports yet, create a record
      await db.insert(userReportsCount)
        .values({
          userId: userId,
          count: 0,
          updatedAt: new Date()
        });
      
      // Fetch the newly created record to ensure we have accurate count
      userReportCount = await db.select()
        .from(userReportsCount)
        .where(eq(userReportsCount.userId, userId));
      
      if (userReportCount.length > 0) {
        reportsCreated = userReportCount[0].count;
      }
    } else {
      reportsCreated = userReportCount[0].count;
    }
    
    // Get the actual count of reports in the database as a fallback verification
    const actualReportCount = await db.select({ count: reports.id })
      .from(reports)
      .where(eq(reports.userId, userId));
    
    // If there's a mismatch between the stored count and actual reports, update the count
    if (actualReportCount.length !== reportsCreated) {
      console.log(`Mismatch detected: stored count=${reportsCreated}, actual reports=${actualReportCount.length}`);
      reportsCreated = actualReportCount.length;
      
      // Update the count to match reality
      await db.update(userReportsCount)
        .set({
          count: actualReportCount.length,
          updatedAt: new Date()
        })
        .where(eq(userReportsCount.userId, userId));
    }
    
    // Free users are limited to 2 reports
    const FREE_REPORT_LIMIT = 2;
    
    return {
      canCreateReport: reportsCreated < FREE_REPORT_LIMIT,
      hasActiveSubscription,
      reportsCreated,
      limit: FREE_REPORT_LIMIT
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    Sentry.captureException(error);
    // Default to no active subscription in case of error
    return {
      canCreateReport: false,
      hasActiveSubscription: false,
      reportsCreated: 0,
      limit: 2,
      error: error.message
    };
  }
}

// Update user's report count
async function incrementReportCount(db, userId) {
  try {
    console.log(`Incrementing report count for user: ${userId}`);
    
    // Check if user has a record in userReportsCount
    let userReportCount = await db.select()
      .from(userReportsCount)
      .where(eq(userReportsCount.userId, userId));
    
    if (userReportCount.length === 0) {
      // User doesn't have a record yet, create one
      const inserted = await db.insert(userReportsCount)
        .values({
          userId: userId,
          count: 1,
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`Created new report count record with count=1: ${JSON.stringify(inserted)}`);
    } else {
      // Get current count
      const currentCount = userReportCount[0].count;
      const newCount = currentCount + 1;
      
      // Increment the existing count
      const updated = await db.update(userReportsCount)
        .set({
          count: newCount,
          updatedAt: new Date()
        })
        .where(eq(userReportsCount.userId, userId))
        .returning();
      
      console.log(`Updated report count from ${currentCount} to ${newCount}: ${JSON.stringify(updated)}`);
    }
    
    // Verify the update was successful
    const verifyCount = await db.select()
      .from(userReportsCount)
      .where(eq(userReportsCount.userId, userId));
    
    if (verifyCount.length > 0) {
      console.log(`Verified report count is now: ${verifyCount[0].count}`);
    } else {
      console.error(`Failed to verify report count update for user: ${userId}`);
    }
  } catch (error) {
    console.error(`Error incrementing report count for user ${userId}:`, error);
    Sentry.captureException(error);
    throw error; // Re-throw to ensure calling code knows there was an error
  }
}

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
        console.log(`Report ID type: ${typeof id}, value: ${id}, user ID: ${user.id}`);
        
        // IMPORTANT: Always use the string version of the ID for database queries
        // to avoid JavaScript number precision issues with large integers
        const reportId = String(id).trim();
        console.log(`Using string value for report ID: ${reportId}`);
        
        // First check if the report exists for this user
        const reportExists = await db.select({ exists: reports.id })
          .from(reports)
          .where(and(
            eq(reports.userId, user.id)
          ));
        
        console.log(`Found ${reportExists.length} reports for user ${user.id}`);
        
        // Get the report details
        const reportDetails = await db.select()
          .from(reports)
          .where(and(
            eq(reports.id, reportId),
            eq(reports.userId, user.id)
          ));
        
        console.log(`Query returned ${reportDetails.length} reports`);
        
        // If no report found, do some diagnostics
        if (reportDetails.length === 0) {
          console.log(`No report found with ID ${reportId} for user ${user.id}`);
          
          // Check if this report exists at all (for any user)
          const reportForAnyUser = await db.select({ userId: reports.userId })
            .from(reports)
            .where(eq(reports.id, reportId));
          
          if (reportForAnyUser.length > 0) {
            console.log(`Report exists but belongs to user ${reportForAnyUser[0].userId}, not ${user.id}`);
            return res.status(404).json({ error: 'Report not found for your account' });
          }
          
          // List available reports for debugging
          const userReports = await db.select({
            id: reports.id,
            title: reports.title
          })
            .from(reports)
            .where(eq(reports.userId, user.id))
            .limit(5);
          
          if (userReports.length > 0) {
            console.log(`Sample reports for user ${user.id}:`);
            userReports.forEach((r, i) => {
              console.log(`[${i}] ID: ${r.id} (${typeof r.id}), Title: ${r.title}`);
            });
          } else {
            console.log(`User ${user.id} has no reports in the database`);
          }
          
          return res.status(404).json({ error: 'Report not found' });
        }

        const report = reportDetails[0];
        
        // Ensure date values are properly formatted strings before using them
        const startDateFormatted = ensureDateString(report.startDate);
        const endDateFormatted = ensureDateString(report.endDate);
        
        if (!startDateFormatted || !endDateFormatted) {
          console.error(`Invalid date values in report: startDate=${report.startDate}, endDate=${report.endDate}`);
          return res.status(500).json({ error: 'Invalid date values in report' });
        }
        
        console.log(`Fetching medications for user ${user.id} for report period ${startDateFormatted} to ${endDateFormatted}`);

        // First fetch ALL medications for this user to ensure we don't miss any
        const allMedicationsList = await db.select()
          .from(medications)
          .where(eq(medications.userId, user.id))
          .orderBy(medications.startDate);
        
        console.log(`Found ${allMedicationsList.length} total medications for this user`);
        
        // Then filter them to find those active during the report period
        const medicationsList = allMedicationsList.filter(med => {
          try {
            // Ensure all date values are valid before comparison
            const medicationStartStr = ensureDateString(med.startDate);
            const medicationEndStr = med.endDate ? ensureDateString(med.endDate) : null;
            
            if (!medicationStartStr) {
              console.warn(`Skipping medication ${med.id} due to invalid start date: ${med.startDate}`);
              return false;
            }
            
            const medicationStart = new Date(medicationStartStr);
            const medicationEnd = medicationEndStr ? new Date(medicationEndStr) : null;
            const reportStart = new Date(startDateFormatted);
            const reportEnd = new Date(endDateFormatted);
            
            // Medication started before or during the report period
            const startedBeforeOrDuringReport = medicationStart <= reportEnd;
            
            // Medication ended after the report started or is still active
            const endedAfterReportStartedOrStillActive = !medicationEnd || medicationEnd >= reportStart;
            
            const isActive = startedBeforeOrDuringReport && endedAfterReportStartedOrStillActive;
            
            if (isActive) {
              console.log(`Including medication: ${med.name} (${medicationStartStr} to ${medicationEndStr || 'ongoing'})`);
            }
            
            return isActive;
          } catch (error) {
            console.error(`Error processing medication ${med.id}:`, error);
            Sentry.captureException(error);
            return false;
          }
        });
        
        console.log(`After filtering, found ${medicationsList.length} medications active during report period`);

        try {
          // Get side effects during the report period
          const sideEffectsList = await db.select({
            sideEffect: sideEffects,
            medicationName: medications.name
          })
            .from(sideEffects)
            .leftJoin(medications, eq(sideEffects.medicationId, medications.id))
            .where(and(
              eq(sideEffects.userId, user.id),
              between(sideEffects.date, startDateFormatted, endDateFormatted)
            ))
            .orderBy(sideEffects.date, sideEffects.createdAt);

          // Get daily check-ins during the report period
          const checkinsList = await db.select()
            .from(dailyCheckins)
            .where(and(
              eq(dailyCheckins.userId, user.id),
              between(dailyCheckins.date, startDateFormatted, endDateFormatted)
            ))
            .orderBy(dailyCheckins.date);

          // Format side effects
          const formattedSideEffects = sideEffectsList.map(row => ({
            ...row.sideEffect,
            medicationName: row.medicationName
          }));

          console.log(`Successfully assembled report data. Medications: ${medicationsList.length}, Side Effects: ${formattedSideEffects.length}, Check-ins: ${checkinsList.length}`);
          
          // Convert any BigInt values to strings before returning the JSON response
          const responseData = {
            report,
            medications: medicationsList,
            sideEffects: formattedSideEffects,
            checkins: checkinsList
          };
          
          return res.status(200).json(convertBigIntToString(responseData));
        } catch (error) {
          console.error('Error fetching report data:', error);
          Sentry.captureException(error);
          return res.status(500).json({ error: `Failed to fetch report data: ${error.message}` });
        }
      }
      
      // Otherwise return the list of reports
      console.log(`Fetching reports list for user: ${user.id}`);
      const result = await db.select()
        .from(reports)
        .where(eq(reports.userId, user.id))
        .orderBy(desc(reports.createdAt));
      
      // Check subscription status and report limit
      const subscriptionStatus = await checkReportLimit(db, user.id, user.email);
      
      console.log(`Found ${result.length} reports`);
      // Convert any BigInt values to strings
      return res.status(200).json({
        reports: convertBigIntToString(result),
        subscription: subscriptionStatus
      });
    }
    
    // POST request - create a new report
    if (req.method === 'POST') {
      const { title, startDate, endDate } = req.body;
      console.log(`Creating new report: ${title} for user: ${user.id}`);
      
      if (!title || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user has reached the report limit
      const limitStatus = await checkReportLimit(db, user.id, user.email);
      
      if (!limitStatus.canCreateReport) {
        return res.status(403).json({
          error: 'You have reached the free report limit',
          subscription: limitStatus
        });
      }

      try {
        // Format dates as strings consistently
        const formattedStartDate = ensureDateString(startDate);
        const formattedEndDate = ensureDateString(endDate);
        
        if (!formattedStartDate || !formattedEndDate) {
          return res.status(400).json({ error: 'Invalid date format provided' });
        }
        
        const result = await db.insert(reports)
          .values({
            userId: user.id,
            title,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          })
          .returning();

        // Increment the user's report count
        await incrementReportCount(db, user.id);

        console.log(`Created report with ID: ${result[0].id} (type: ${typeof result[0].id})`);
        // Convert any BigInt values to strings
        return res.status(201).json(convertBigIntToString(result[0]));
      } catch (error) {
        console.error('Error inserting report:', error);
        Sentry.captureException(error);
        return res.status(500).json({ error: `Failed to create report: ${error.message}` });
      }
    }

    // DELETE request - delete a report
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log(`Deleting report ID: ${id} (type: ${typeof id}) for user: ${user.id}`);
      
      if (!id) {
        return res.status(400).json({ error: 'Missing report ID' });
      }

      try {
        // Use string ID to avoid precision issues
        const reportId = String(id).trim();
        console.log(`Using string for report ID: ${reportId}`);

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

        // Update the report count after deleting a report
        try {
          // Get current count
          const userReportCount = await db.select()
            .from(userReportsCount)
            .where(eq(userReportsCount.userId, user.id));
          
          if (userReportCount.length > 0) {
            const currentCount = userReportCount[0].count;
            const newCount = Math.max(0, currentCount - 1); // Ensure count never goes below 0
            
            // Update the count
            await db.update(userReportsCount)
              .set({
                count: newCount,
                updatedAt: new Date()
              })
              .where(eq(userReportsCount.userId, user.id));
            
            console.log(`Updated report count from ${currentCount} to ${newCount} after deletion`);
          }
        } catch (countError) {
          console.error('Error updating report count after deletion:', countError);
          Sentry.captureException(countError);
          // Continue without failing the deletion
        }

        console.log(`Successfully deleted report with ID: ${reportId}`);
        // Convert any BigInt values to strings
        return res.status(200).json(convertBigIntToString({ success: true }));
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