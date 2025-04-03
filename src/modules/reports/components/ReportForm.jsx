import React, { useState } from 'react';
import { format, subDays } from 'date-fns';

export default function ReportForm({ onSubmit, onCancel }) {
  const today = new Date();
  const lastMonth = subDays(today, 30);
  
  const [formData, setFormData] = useState({
    title: `Health Report - ${format(today, 'MMMM yyyy')}`,
    startDate: format(lastMonth, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd'),
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
      
      if (!formData.title.trim()) {
        setError('Report title is required');
        return;
      }
      
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate < startDate) {
        setError('End date must be after start date');
        return;
      }
      
      await onSubmit(formData);
    } catch (err) {
      console.error('Error creating report:', err);
      setError('Failed to create report. Please try again.');
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
        <label htmlFor="title" className="label">Report Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input box-border"
          placeholder="e.g., Monthly Health Report - June 2023"
          required
        />
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
        <label htmlFor="endDate" className="label">End Date</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="input box-border"
          required
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
              Creating...
            </span>
          ) : (
            'Create Report'
          )}
        </button>
      </div>
    </form>
  );
}