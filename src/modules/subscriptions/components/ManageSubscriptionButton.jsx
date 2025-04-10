import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import * as Sentry from '@sentry/browser';

export default function ManageSubscriptionButton({ className = "" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session found');
      }
      
      const response = await fetch('/api/subscriptionPortal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          returnUrl: window.location.href // Return to current page
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Failed to access portal (Status: ${response.status})`);
      }
      
      const portalSession = await response.json();
      
      if (!portalSession.url) {
        throw new Error('No portal URL received from server');
      }
      
      // Redirect to Stripe portal
      window.location.href = portalSession.url;
      
    } catch (error) {
      console.error('Error accessing subscription portal:', error);
      Sentry.captureException(error);
      setError(error.message || 'Failed to access subscription portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleManageSubscription}
        disabled={isLoading}
        className={`btn border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer ${className}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : 'Manage Subscription'}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </>
  );
}