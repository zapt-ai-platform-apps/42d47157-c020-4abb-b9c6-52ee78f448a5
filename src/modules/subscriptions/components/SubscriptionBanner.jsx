import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/modules/auth';
import { supabase } from '@/supabaseClient';
import * as Sentry from '@sentry/browser';

export default function SubscriptionBanner({ canCreateReport, reportsCreated, limit, isVisible = true }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthContext();

  if (!isVisible) {
    return null;
  }
  
  const handleDirectUpgrade = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');
      console.log('Creating Stripe checkout session from banner...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session found');
      }
      
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          currency: 'GBP', // Default to GBP
          returnUrl: `${window.location.origin}/reports` // Return to reports page
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Failed to create subscription (Status: ${response.status})`);
      }
      
      const checkoutSession = await response.json();
      console.log('Received checkout session:', checkoutSession);

      if (!checkoutSession.url) {
        throw new Error('No checkout URL received from server');
      }

      // Redirect to Stripe checkout page
      console.log('Redirecting to Stripe checkout:', checkoutSession.url);
      window.location.href = checkoutSession.url;
      
    } catch (err) {
      console.error('Error creating subscription:', err);
      Sentry.captureException(err);
      setError(err.message || 'Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mb-6 rounded-lg overflow-hidden">
      {error && (
        <div className="bg-red-50 p-3 border border-red-100 mb-2 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {canCreateReport ? (
        <div className="bg-indigo-50 p-4 border border-indigo-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-indigo-700">
                Free plan: {reportsCreated} of {limit} reports used
              </p>
              <p className="mt-3 text-sm md:mt-0 md:ml-6">
                <button
                  onClick={handleDirectUpgrade}
                  disabled={isLoading}
                  className="whitespace-nowrap font-medium text-indigo-700 hover:text-indigo-600 cursor-pointer"
                >
                  {isLoading ? 'Processing...' : 'Upgrade'} <span aria-hidden="true">&rarr;</span>
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 border border-yellow-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-yellow-700">
                You've reached your free plan limit ({limit} reports). Upgrade to create more reports.
              </p>
              <p className="mt-3 text-sm md:mt-0 md:ml-6">
                <button
                  onClick={handleDirectUpgrade}
                  disabled={isLoading}
                  className="whitespace-nowrap font-medium text-yellow-700 hover:text-yellow-600 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>Upgrade Now <span aria-hidden="true">&rarr;</span></>
                  )}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}