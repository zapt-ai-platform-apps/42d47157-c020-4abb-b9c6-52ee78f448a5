import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportForm } from '@/modules/reports';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function ReportCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const handleSubmit = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || 'Failed to create report');
      }
      
      const reportData = await response.json();
      navigate(`/reports/view/${reportData.id}`);
    } catch (err) {
      console.error('Error creating report:', err);
      Sentry.captureException(err);
      setError('Failed to create report. Please try again.');
      throw err; // Re-throw to let the form component handle it
    }
  };
  
  const handleCancel = () => {
    navigate('/reports');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Doctor Report</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <ReportForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}