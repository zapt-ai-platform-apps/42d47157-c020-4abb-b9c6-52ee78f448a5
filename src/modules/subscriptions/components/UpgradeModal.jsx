import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/modules/auth';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';
import { CurrencySelector } from '@/modules/subscriptions';

export default function UpgradeModal({ isOpen, onClose }) {
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const pricing = {
    GBP: { value: '£4', period: 'month' },
    USD: { value: '$5', period: 'month' }
  };

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Creating Stripe checkout session from modal with currency:', selectedCurrency);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session found');
      }
      
      console.log('Making request to /api/subscriptions endpoint');
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          currency: selectedCurrency,
          returnUrl: `${window.location.origin}/reports/create` // Redirect back to report creation
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
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      Sentry.captureException(error);
      setError(error.message || 'Failed to create subscription. Please try again.');
      setIsLoading(false); // Make sure loading state is reset even if we show an error
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Upgrade to Standard Plan
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You've reached your free plan limit. Upgrade to the Standard Plan to create unlimited reports.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-5 sm:mt-6">
            <div className="mb-4">
              <div className="flex justify-center space-x-4">
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-gray-900">{pricing[selectedCurrency].value}</span>
              <span className="text-lg text-gray-500">/{pricing[selectedCurrency].period}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubscribe}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Upgrade Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}