import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { userReportsCount } from '../drizzle/schema.js';
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
    console.log(`Authenticated user: ${user.id}, email: ${user.email}`);
    
    // Initialize Stripe with API key
    if (!process.env.STRIPE_API_KEY) {
      throw new Error('Missing STRIPE_API_KEY environment variable');
    }
    
    const stripe = new Stripe(process.env.STRIPE_API_KEY);
    client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // GET request - retrieve user's subscription status directly from Stripe
    if (req.method === 'GET') {
      console.log(`Fetching subscription status for user: ${user.id}, email: ${user.email}`);
      
      // Search for a customer in Stripe by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });
      
      let hasActiveSubscription = false;
      let subscription = null;
      
      // If customer exists, get their subscriptions
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        console.log(`Found Stripe customer: ${customer.id}`);
        
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1
        });
        
        if (subscriptions.data.length > 0) {
          hasActiveSubscription = true;
          subscription = subscriptions.data[0];
          console.log(`Found active subscription: ${subscription.id}`);
        } else {
          console.log('No active subscriptions found');
        }
      } else {
        console.log('No Stripe customer found with this email');
      }
      
      return res.status(200).json({
        hasActiveSubscription,
        subscription
      });
    }
    
    // POST request - create a checkout session for subscription
    if (req.method === 'POST') {
      const { currency = 'GBP', returnUrl } = req.body;
      
      if (!['GBP', 'USD'].includes(currency)) {
        return res.status(400).json({ error: 'Invalid currency. Please choose GBP or USD.' });
      }

      if (!PRICE_IDS[currency]) {
        return res.status(400).json({ error: `Price ID not found for currency: ${currency}` });
      }

      console.log(`Creating checkout session for user: ${user.id}, currency: ${currency}`);
      
      try {
        // Initialize the Stripe client with the API key
        console.log('Creating Stripe checkout session...');
        
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
          subscription_data: {
            application_fee_percent: 30,
          }
        });
        
        console.log(`Created checkout session: ${session.id}, URL: ${session.url}`);
        
        return res.status(200).json({
          id: session.id,
          url: session.url
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        Sentry.captureException(stripeError);
        return res.status(500).json({ 
          error: 'Error creating Stripe checkout session', 
          details: stripeError.message 
        });
      }
    }

    // If we get here, the method is not supported
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in subscriptions API:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (client) {
      await client.end();
    }
  }
}
