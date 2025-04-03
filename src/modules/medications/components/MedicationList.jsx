import React from 'react';
import { format, isValid } from 'date-fns';

function MedicationItem({ medication, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
  };

  return (
    <div className="card mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{medication.name}</h3>
          <p className="text-gray-600">{medication.dosage} • {medication.frequency}</p>
          <p className="text-sm text-gray-500 mt-1">
            Started: {formatDate(medication.startDate)}
            {medication.endDate && ` • Ended: ${formatDate(medication.endDate)}`}
          </p>
          {medication.notes && (
            <p className="mt-2 text-gray-700 text-sm">{medication.notes}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(medication)}
            className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(medication.id)}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MedicationList({ medications, onEdit, onDelete }) {
  if (medications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't added any medications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {medications.map(medication => (
        <MedicationItem
          key={medication.id}
          medication={medication}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}