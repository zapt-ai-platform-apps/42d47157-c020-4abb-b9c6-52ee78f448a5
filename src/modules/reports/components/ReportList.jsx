import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function ReportList({ reports, onView, onDelete, deletingId, subscription }) {
  // Helper function to safely format dates
  const formatSafeDate = (dateString, formatStr = 'MMM d, yyyy') => {
    if (!dateString) return 'N/A';
    
    try {
      // Create a new Date object from the ISO string
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error(`Invalid date: ${dateString}`);
        return 'N/A';
      }
      
      // Format the date
      return format(date, formatStr);
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No reports yet. Create your first report to track your health journey.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Subscription Alert for free users */}
      {subscription && !subscription.hasActiveSubscription && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-indigo-700">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Free Plan: {subscription.reportsCreated} of {subscription.limit} reports used</h3>
              <div className="mt-2 text-sm">
                <p>You're currently on the free plan, which allows {subscription.limit} reports. Upgrade to the Standard Plan for unlimited reports.</p>
              </div>
              <div className="mt-3">
                <Link to="/pricing" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  View Pricing <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Range
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{report.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatSafeDate(report.startDate)} - {formatSafeDate(report.endDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatSafeDate(report.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onView(report.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                    disabled={deletingId === report.id}
                  >
                    View
                  </button>
                  <button
                    onClick={() => onDelete(report.id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer"
                    disabled={deletingId !== null}
                  >
                    {deletingId === report.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}