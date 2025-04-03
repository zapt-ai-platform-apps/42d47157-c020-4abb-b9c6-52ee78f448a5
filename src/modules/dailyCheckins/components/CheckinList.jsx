import React from 'react';
import { format, isValid } from 'date-fns';

function RatingBadge({ value, label }) {
  let colorClass = 'badge-blue';
  
  if (value <= 3) {
    colorClass = 'badge-red';
  } else if (value <= 5) {
    colorClass = 'badge-yellow';
  } else if (value <= 8) {
    colorClass = 'badge-green';
  } else {
    colorClass = 'badge-blue';
  }
  
  return (
    <span className={colorClass}>
      {label}: {value}/10
    </span>
  );
}

function MoodBadge({ mood }) {
  let colorClass = 'badge-blue';
  
  switch (mood) {
    case 'Great':
    case 'Good':
      colorClass = 'badge-blue';
      break;
    case 'Okay':
      colorClass = 'badge-green';
      break;
    case 'Tired':
      colorClass = 'badge-purple';
      break;
    case 'Anxious':
    case 'Irritable':
      colorClass = 'badge-yellow';
      break;
    case 'Sad':
    case 'Depressed':
      colorClass = 'badge-red';
      break;
    default:
      colorClass = 'badge-gray';
  }
  
  return (
    <span className={colorClass}>
      {mood}
    </span>
  );
}

function CheckinItem({ checkin, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'EEE, MMM d, yyyy') : 'N/A';
  };

  return (
    <div className="card mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">Check-in: {formatDate(checkin.date)}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <RatingBadge value={checkin.overallFeeling} label="Overall" />
            <RatingBadge value={checkin.sleepQuality} label="Sleep" />
            <RatingBadge value={checkin.energyLevel} label="Energy" />
            <MoodBadge mood={checkin.mood} />
          </div>
          {checkin.notes && (
            <p className="mt-3 text-gray-700 text-sm">{checkin.notes}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(checkin)}
            className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(checkin.id)}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckinList({ checkins, onEdit, onDelete }) {
  if (checkins.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't recorded any check-ins yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checkins.map(checkin => (
        <CheckinItem
          key={checkin.id}
          checkin={checkin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}