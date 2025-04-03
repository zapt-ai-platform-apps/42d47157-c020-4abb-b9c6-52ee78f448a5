import React, { useState } from 'react';
import { format } from 'date-fns';

const RATING_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MOOD_OPTIONS = [
  "Great",
  "Good",
  "Okay",
  "Tired",
  "Anxious",
  "Irritable",
  "Sad",
  "Depressed",
  "Other"
];

export default function CheckinForm({ checkin, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    id: checkin?.id || null,
    date: checkin?.date ? format(new Date(checkin.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    overallFeeling: checkin?.overallFeeling || 5,
    sleepQuality: checkin?.sleepQuality || 5,
    energyLevel: checkin?.energyLevel || 5,
    mood: checkin?.mood || MOOD_OPTIONS[0],
    notes: checkin?.notes || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Make the API call to create/update the check-in
      const payload = {
        ...formData,
        overallFeeling: parseInt(formData.overallFeeling),
        sleepQuality: parseInt(formData.sleepQuality),
        energyLevel: parseInt(formData.energyLevel)
      };
      
      await onSubmit(payload);
    } catch (err) {
      console.error('Error saving check-in:', err);
      setError('Failed to save check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="date" className="label">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="input box-border"
          required
        />
      </div>
      
      <div>
        <label htmlFor="overallFeeling" className="label">Overall Feeling (1-10)</label>
        <div className="flex items-center space-x-3">
          <select
            id="overallFeeling"
            name="overallFeeling"
            value={formData.overallFeeling}
            onChange={handleChange}
            className="input box-border w-24"
            required
          >
            {RATING_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            1: Poor - 10: Excellent
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="sleepQuality" className="label">Sleep Quality (1-10)</label>
        <div className="flex items-center space-x-3">
          <select
            id="sleepQuality"
            name="sleepQuality"
            value={formData.sleepQuality}
            onChange={handleChange}
            className="input box-border w-24"
            required
          >
            {RATING_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            1: Poor - 10: Excellent
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="energyLevel" className="label">Energy Level (1-10)</label>
        <div className="flex items-center space-x-3">
          <select
            id="energyLevel"
            name="energyLevel"
            value={formData.energyLevel}
            onChange={handleChange}
            className="input box-border w-24"
            required
          >
            {RATING_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            1: Low - 10: High
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="mood" className="label">Mood</label>
        <select
          id="mood"
          name="mood"
          value={formData.mood}
          onChange={handleChange}
          className="input box-border"
          required
        >
          {MOOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="notes" className="label">Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="input box-border min-h-[100px]"
          placeholder="How are you feeling today? Any other observations?"
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary cursor-pointer"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            checkin?.id ? 'Update Check-in' : 'Save Check-in'
          )}
        </button>
      </div>
    </form>
  );
}