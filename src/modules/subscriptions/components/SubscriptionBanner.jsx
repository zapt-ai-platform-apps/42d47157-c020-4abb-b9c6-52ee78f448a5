import React from 'react';
import { Link } from 'react-router-dom';

export default function SubscriptionBanner({ canCreateReport, reportsCreated, limit, isVisible = true }) {
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="mb-6 rounded-lg overflow-hidden">
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
                <Link to="/pricing" className="whitespace-nowrap font-medium text-indigo-700 hover:text-indigo-600">
                  Upgrade <span aria-hidden="true">&rarr;</span>
                </Link>
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
                <Link to="/pricing" className="whitespace-nowrap font-medium text-yellow-700 hover:text-yellow-600">
                  Upgrade Now <span aria-hidden="true">&rarr;</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}