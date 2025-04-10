import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/modules/auth';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function UpgradeModal({ isOpen, onClose }) {
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [isLoading, setIsLoading] = useState(false);
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
      
      const { data: { session } } = await supabase.auth.getSession();
      
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }
      
      const checkoutSession = await response.json();

      // Redirect to Stripe checkout page
      window.location.href = checkoutSession.url;
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      Sentry.captureException(error);
    } finally {
      setIsLoading(false);
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

          <div className="mt-5 sm:mt-6">
            <div className="mb-4">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSelectedCurrency('GBP')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    selectedCurrency === 'GBP'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } cursor-pointer`}
                >
                  GBP (£)
                </button>
                <button
                  onClick={() => setSelectedCurrency('USD')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    selectedCurrency === 'USD'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } cursor-pointer`}
                >
                  USD ($)
                </button>
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
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubscribe}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}