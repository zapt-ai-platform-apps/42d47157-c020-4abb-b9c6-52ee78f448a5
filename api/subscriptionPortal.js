import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import Stripe from 'stripe';

export default async function handler(req, res) {
  console.log(`Processing ${req.method} request to /api/subscriptionPortal`);

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = await authenticateUser(req);
    console.log(`Authenticated user: ${user.id}, email: ${user.email}`);
    
    if (!user.email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Initialize Stripe with API key
    if (!process.env.STRIPE_API_KEY) {
      throw new Error('Missing STRIPE_API_KEY environment variable');
    }
    
    const stripe = new Stripe(process.env.STRIPE_API_KEY);
    
    // Search for a customer in Stripe by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    
    // Customer must exist in Stripe
    if (customers.data.length === 0) {
      return res.status(404).json({ 
        error: 'No active subscription found. Please subscribe first.' 
      });
    }
    
    const customer = customers.data[0];
    
    // Check if the customer has any active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length === 0) {
      return res.status(404).json({ 
        error: 'No active subscription found. Please subscribe first.' 
      });
    }
    
    const { returnUrl } = req.body;
    
    // Check which API key to use for customer portal
    if (!process.env.STRIPE_API_KEY) {
      throw new Error('Missing STRIPE_API_KEY_CHECKOUTS environment variable');
    }
    
    // Create a billing portal session
    const stripePortal = new Stripe(process.env.STRIPE_API_KEY);
    const session = await stripePortal.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || `${req.headers.origin || 'https://sidetrack.zapt.ai'}/dashboard`,
    });
    
    console.log(`Created portal session: ${session.url}`);
    return res.status(200).json({
      url: session.url
    });
  } catch (error) {
    console.error('Error in subscriptionPortal API:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
