import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { subscriptions } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const PRICE_IDS = {
  GBP: 'price_1RCJSQB1e4Ppxoh03bw4Z9HF',
  USD: 'price_1RCJSQB1e4Ppxoh03bw4Z9HF' // In actual use, this would be a different price ID
};

export default async function handler(req, res) {
  console.log(`Processing ${req.method} request to /api/subscriptions`);

  let client = null;

  try {
    const user = await authenticateUser(req);
    client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // GET request - retrieve user's subscription status
    if (req.method === 'GET') {
      console.log(`Fetching subscription status for user: ${user.id}`);
      
      const result = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
        .orderBy(subscriptions.createdAt);

      const activeSubscription = result.find(sub => 
        sub.status === 'active' || sub.status === 'trialing'
      );
      
      return res.status(200).json({
        hasActiveSubscription: !!activeSubscription,
        subscription: activeSubscription || null
      });
    }
    
    // POST request - create a checkout session for subscription
    if (req.method === 'POST') {
      const { currency = 'GBP', returnUrl } = req.body;
      
      if (!['GBP', 'USD'].includes(currency)) {
        return res.status(400).json({ error: 'Invalid currency. Please choose GBP or USD.' });
      }

      console.log(`Creating checkout session for user: ${user.id}, currency: ${currency}`);
      
      // Initialize the Stripe client with the API key
      const stripe = new Stripe(process.env.STRIPE_API_KEY);
      
      // Create the checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: PRICE_IDS[currency],
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${returnUrl || 'https://sidetrack.zapt.ai/dashboard'}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl?.split('?')[0] || 'https://sidetrack.zapt.ai/dashboard'}?canceled=true`,
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: {
          userId: user.id,
        },
      });
      
      // Create a pending subscription record in the database
      const result = await db.insert(subscriptions)
        .values({
          userId: user.id,
          status: 'incomplete',  // Will be updated by webhook
          plan: 'standard',
          currency: currency,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();

      console.log(`Created subscription record with ID: ${result[0].id}`);
      return res.status(200).json({
        id: session.id,
        url: session.url
      });
    }

    // PATCH request - update subscription status (this would be called by a webhook)
    if (req.method === 'PATCH') {
      const { subscriptionId, status } = req.body;
      
      if (!subscriptionId || !status) {
        return res.status(400).json({ error: 'Missing subscriptionId or status' });
      }

      console.log(`Updating subscription status: ${subscriptionId} to ${status}`);
      
      const result = await db.update(subscriptions)
        .set({
          status: status,
          updatedAt: new Date().toISOString()
        })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      return res.status(200).json(result[0]);
    }

    // If we get here, the method is not supported
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in subscriptions API:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.end();
    }
  }
}