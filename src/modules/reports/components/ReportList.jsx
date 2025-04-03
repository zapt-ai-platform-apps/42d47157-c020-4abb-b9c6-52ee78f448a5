import React from 'react';
import { format, isValid } from 'date-fns';

function ReportItem({ report, onView, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
  };

  return (
    <div className="card mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{report.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(report.startDate)} to {formatDate(report.endDate)}
          </p>
          <p className="text-xs text-gray-400">
            Created: {formatDate(report.createdAt)}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onView(report.id)}
            className="btn-primary text-sm py-1 px-3 cursor-pointer"
          >
            View
          </button>
          <button
            onClick={() => onDelete(report.id)}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportList({ reports, onView, onDelete }) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't created any reports yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map(report => (
        <ReportItem
          key={report.id}
          report={report}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}