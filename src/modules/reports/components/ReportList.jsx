import React from 'react';
import { format } from 'date-fns';

export default function ReportList({ reports, onView, onDelete, deletingId, subscription }) {
  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new doctor report.
          </p>
        </div>
      </div>
    );
  }
  
  const formattedSubscriptionUsage = subscription
    ? `${subscription.reportsCreated} of ${subscription.limit} reports used`
    : '';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Reports</h3>
          {subscription && !subscription.hasActiveSubscription && formattedSubscriptionUsage && (
            <p className="text-sm text-gray-500 mt-1">
              {formattedSubscriptionUsage}
            </p>
          )}
        </div>
        {subscription && subscription.hasActiveSubscription && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
            Standard Plan
          </span>
        )}
      </div>
      
      <ul className="divide-y divide-gray-200">
        {reports.map((report) => (
          <li key={report.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-indigo-600 truncate">{report.title}</p>
                </div>
                <div className="mt-2 flex">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg 
                      className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    {report.startDate && report.endDate ? (
                      <span>{format(new Date(report.startDate), 'MMM d, yyyy')} - {format(new Date(report.endDate), 'MMM d, yyyy')}</span>
                    ) : (
                      <span>Date range not available</span>
                    )}
                  </div>
                  <div className="ml-4 flex items-center text-sm text-gray-500">
                    <svg 
                      className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    {report.createdAt ? (
                      <span>Created {format(new Date(report.createdAt), 'MMM d, yyyy')}</span>
                    ) : (
                      <span>Creation date not available</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-4 flex items-center space-x-3">
                <button
                  onClick={() => onView(report.id)}
                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer"
                  disabled={deletingId !== null}
                >
                  View
                </button>
                <button
                  onClick={() => onDelete(report.id)}
                  className={`inline-flex items-center text-xs font-medium ${
                    deletingId === report.id 
                      ? 'text-gray-400' 
                      : 'text-red-600 hover:text-red-900 cursor-pointer'
                  }`}
                  disabled={deletingId !== null}
                >
                  {deletingId === report.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}