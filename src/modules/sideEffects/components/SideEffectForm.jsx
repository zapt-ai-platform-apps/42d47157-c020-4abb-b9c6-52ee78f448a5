import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const TIME_OF_DAY_OPTIONS = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night"
];

const SEVERITY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function SideEffectForm({ sideEffect, medications, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    id: sideEffect?.id || null,
    medicationId: sideEffect?.medicationId || (medications[0]?.id || ''),
    symptom: sideEffect?.symptom || '',
    severity: sideEffect?.severity || 5,
    timeOfDay: sideEffect?.timeOfDay || TIME_OF_DAY_OPTIONS[0],
    date: sideEffect?.date ? format(new Date(sideEffect.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    notes: sideEffect?.notes || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Update selected medication if medications load after component mounts
  useEffect(() => {
    if (!formData.medicationId && medications.length > 0) {
      setFormData(prev => ({
        ...prev,
        medicationId: medications[0].id
      }));
    }
  }, [medications, formData.medicationId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      if (!formData.medicationId) {
        setError('Please select a medication');
        return;
      }
      
      if (!formData.symptom.trim()) {
        setError('Please describe the side effect');
        return;
      }
      
      // Make the API call to create/update the side effect
      const payload = {
        ...formData,
        medicationId: parseInt(formData.medicationId),
        severity: parseInt(formData.severity)
      };
      
      await onSubmit(payload);
    } catch (err) {
      console.error('Error saving side effect:', err);
      setError('Failed to save side effect. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="medicationId" className="label">Related Medication</label>
        <select
          id="medicationId"
          name="medicationId"
          value={formData.medicationId}
          onChange={handleChange}
          className="input box-border"
          required
        >
          <option value="" disabled>Select a medication</option>
          {medications.map((medication) => (
            <option key={medication.id} value={medication.id}>
              {medication.name} ({medication.dosage})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="symptom" className="label">Side Effect / Symptom</label>
        <input
          type="text"
          id="symptom"
          name="symptom"
          value={formData.symptom}
          onChange={handleChange}
          className="input box-border"
          placeholder="e.g., Headache, Dizziness, Nausea"
          required
        />
      </div>
      
      <div>
        <label htmlFor="severity" className="label">Severity (1-10)</label>
        <div className="flex items-center space-x-3">
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="input box-border w-24"
            required
          >
            {SEVERITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            1: Mild - 10: Severe
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="timeOfDay" className="label">Time of Day</label>
        <select
          id="timeOfDay"
          name="timeOfDay"
          value={formData.timeOfDay}
          onChange={handleChange}
          className="input box-border"
          required
        >
          {TIME_OF_DAY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      
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
        <label htmlFor="notes" className="label">Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="input box-border min-h-[100px]"
          placeholder="Add any additional details about the side effect"
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
            sideEffect?.id ? 'Update Side Effect' : 'Add Side Effect'
          )}
        </button>
      </div>
    </form>
  );
}