import { initializeZapt } from '@zapt/zapt-js';
import Sentry from './_sentry.js';
import { authenticateUser } from './_apiUtils.js';

const APP_ID = process.env.VITE_PUBLIC_APP_ID;
if (!APP_ID) {
  throw new Error('Missing VITE_PUBLIC_APP_ID environment variable');
}

// Initialize ZAPT, which provides the customerSupport function
const { customerSupport } = initializeZapt(APP_ID);

export default async function handler(req, res) {
  console.log('Customer support endpoint hit');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    // Authenticate the user
    const user = await authenticateUser(req);
    console.log('User authenticated:', user.email);
    
    const { email } = req.body;
    if (!email) {
      console.error('Missing email in request body');
      return res.status(400).json({ error: 'Missing email' });
    }
    
    // Verify the authenticated user matches the requested email
    if (user.email !== email) {
      console.error('Email mismatch between authenticated user and request');
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const zaptSecretKey = process.env.ZAPT_SECRET_KEY;
    if (!zaptSecretKey) {
      console.error('Missing ZAPT_SECRET_KEY environment variable');
      throw new Error('Missing ZAPT_SECRET_KEY environment variable');
    }
    
    // Call the ZAPT customerSupport function to get Stream Chat credentials
    console.log('Calling customerSupport with email:', email);
    const supportResponse = await customerSupport(email, zaptSecretKey);
    
    // Validate response contains required fields
    if (!supportResponse || !supportResponse.token || !supportResponse.channelId || 
        !supportResponse.userId || !supportResponse.STREAM_API_KEY) {
      console.error('Incomplete support response:', {
        ...supportResponse,
        token: supportResponse?.token ? '[REDACTED]' : undefined
      });
      throw new Error('Incomplete customer support data returned from server');
    }
    
    console.log('Customer support response received:', {
      channelId: supportResponse.channelId,
      userId: supportResponse.userId,
      hasToken: !!supportResponse.token,
      hasStreamKey: !!supportResponse.STREAM_API_KEY
    });
    
    return res.status(200).json(supportResponse);
  } catch (error) {
    console.error('Error in customerSupport endpoint:', error);
    Sentry.captureException(error, {
      extra: { 
        endpoint: '/api/customerSupport',
        method: req.method,
        email: req.body?.email,
      }
    });
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}