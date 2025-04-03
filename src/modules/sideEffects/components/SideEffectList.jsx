import React from 'react';
import { format, isValid } from 'date-fns';

function SeverityBadge({ severity }) {
  let colorClass = 'badge-blue';
  
  if (severity <= 3) {
    colorClass = 'badge-green';
  } else if (severity <= 6) {
    colorClass = 'badge-yellow';
  } else if (severity <= 8) {
    colorClass = 'badge-orange';
  } else {
    colorClass = 'badge-red';
  }
  
  return (
    <span className={colorClass}>
      Severity: {severity}/10
    </span>
  );
}

function SideEffectItem({ sideEffect, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
  };

  return (
    <div className="card mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{sideEffect.symptom}</h3>
          <div className="mt-1 flex items-center space-x-2">
            <SeverityBadge severity={sideEffect.severity} />
            <span className="text-sm text-gray-600">
              {sideEffect.timeOfDay}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Medication: {sideEffect.medicationName || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(sideEffect.date)}
          </p>
          {sideEffect.notes && (
            <p className="mt-2 text-gray-700 text-sm">{sideEffect.notes}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(sideEffect)}
            className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(sideEffect.id)}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SideEffectList({ sideEffects, onEdit, onDelete }) {
  if (sideEffects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't recorded any side effects yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sideEffects.map(sideEffect => (
        <SideEffectItem
          key={sideEffect.id}
          sideEffect={sideEffect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}