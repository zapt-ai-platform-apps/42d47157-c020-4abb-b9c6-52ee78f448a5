import React from 'react';
import { format, parseISO, isValid } from 'date-fns';

export default function ReportList({ reports, onView, onDelete, isDeleting }) {
  // Helper function to safely format dates
  const formatSafeDate = (dateString, formatStr = 'MMM d, yyyy') => {
    if (!dateString) return 'N/A';
    
    try {
      // For ISO strings, use parseISO
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = parseISO(dateString);
        if (isValid(date)) return format(date, formatStr);
      }
      
      // Standard date parsing
      const date = new Date(dateString);
      if (isValid(date)) return format(date, formatStr);
      
      return 'N/A';
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
                  disabled={isDeleting}
                >
                  View
                </button>
                <button
                  onClick={() => onDelete(report.id)}
                  className="text-red-600 hover:text-red-900 cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}