import React, { useState } from 'react';
import { format } from 'date-fns';

const FREQUENCY_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Once weekly",
  "Every other day",
  "As needed",
  "Other"
];

export default function MedicationForm({ medication, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    id: medication?.id || null,
    name: medication?.name || '',
    dosage: medication?.dosage || '',
    frequency: medication?.frequency || FREQUENCY_OPTIONS[0],
    startDate: medication?.startDate ? format(new Date(medication.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endDate: medication?.endDate ? format(new Date(medication.endDate), 'yyyy-MM-dd') : '',
    notes: medication?.notes || '',
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
      
      if (!formData.name.trim()) {
        setError('Medication name is required');
        return;
      }
      
      if (!formData.dosage.trim()) {
        setError('Dosage is required');
        return;
      }
      
      // Make the API call to create/update the medication
      const payload = {
        ...formData,
        startDate: formData.startDate,
        endDate: formData.endDate || null
      };
      
      await onSubmit(payload);
    } catch (err) {
      console.error('Error saving medication:', err);
      setError('Failed to save medication. Please try again.');
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
        <label htmlFor="name" className="label">Medication Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input box-border"
          placeholder="e.g., Lisinopril"
          required
        />
      </div>
      
      <div>
        <label htmlFor="dosage" className="label">Dosage</label>
        <input
          type="text"
          id="dosage"
          name="dosage"
          value={formData.dosage}
          onChange={handleChange}
          className="input box-border"
          placeholder="e.g., 10mg"
          required
        />
      </div>
      
      <div>
        <label htmlFor="frequency" className="label">Frequency</label>
        <select
          id="frequency"
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          className="input box-border"
          required
        >
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="startDate" className="label">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="input box-border"
          required
        />
      </div>
      
      <div>
        <label htmlFor="endDate" className="label">End Date (Optional)</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="input box-border"
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
          placeholder="Add any additional notes or observations"
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
            medication?.id ? 'Update Medication' : 'Add Medication'
          )}
        </button>
      </div>
    </form>
  );
}