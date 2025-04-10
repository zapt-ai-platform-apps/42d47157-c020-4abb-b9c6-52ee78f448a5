import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/modules/auth';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function PricingSection({ className = "", isPage = false }) {
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const pricing = {
    GBP: { value: '£4', period: 'month' },
    USD: { value: '$5', period: 'month' }
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

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
          returnUrl: `${window.location.origin}/dashboard` // Where to redirect after checkout
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

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  return (
    <div className={`${className} py-12 bg-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isPage && (
          <div className="sm:flex sm:flex-col sm:align-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-center">SideTrack Pricing Plans</h1>
            <p className="mt-5 text-xl text-gray-500 sm:text-center">
              Choose the plan that works best for your medication tracking needs
            </p>
          </div>
        )}

        <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900">Free Plan</h2>
              <p className="mt-4 text-sm text-gray-500">
                Perfect for getting started with medication tracking
              </p>
              <p className="mt-8">
                <span className="text-4xl font-bold text-gray-900">Free</span>
                <span className="text-base font-medium text-gray-500">/forever</span>
              </p>
              <button
                disabled
                className="mt-8 w-full bg-white border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-default"
              >
                Current Plan
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-sm font-medium text-gray-900">Features included:</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700">Unlimited medication tracking</p>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700">Unlimited side effect logging</p>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700">Unlimited daily check-ins</p>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700">Basic doctor reports</p>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700"><span className="font-bold">Limited to 2 reports</span></p>
                </li>
              </ul>
            </div>
          </div>

          {/* Standard Plan */}
          <div className="border border-indigo-500 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6 bg-indigo-50 rounded-t-lg">
              <h2 className="text-xl font-medium text-indigo-900">Standard Plan</h2>
              <p className="mt-4 text-sm text-indigo-700">
                For users who need comprehensive reporting capabilities
              </p>
              
              {/* Currency toggle */}
              <div className="mt-4 flex items-center justify-start space-x-3">
                <button 
                  onClick={() => handleCurrencyChange('GBP')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedCurrency === 'GBP' 
                      ? 'bg-indigo-600 text-white font-medium' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  } cursor-pointer`}
                >
                  GBP (£)
                </button>
                <button 
                  onClick={() => handleCurrencyChange('USD')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedCurrency === 'USD' 
                      ? 'bg-indigo-600 text-white font-medium' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  } cursor-pointer`}
                >
                  USD ($)
                </button>
              </div>
              
              <p className="mt-8">
                <span className="text-4xl font-bold text-indigo-900">{pricing[selectedCurrency].value}</span>
                <span className="text-base font-medium text-indigo-700">/{pricing[selectedCurrency].period}</span>
              </p>
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="mt-8 w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
              >
                {isLoading ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-sm font-medium text-gray-900">Everything in Free, plus:</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700"><span className="font-bold">Unlimited reports</span> for doctor visits</p>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700">Enhanced PDF exports</p>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700">Priority support</p>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700">Advanced pattern detection</p>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-gray-700">Support the ongoing development of SideTrack</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}