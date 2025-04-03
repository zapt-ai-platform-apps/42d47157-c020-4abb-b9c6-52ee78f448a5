import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckinForm } from '@/modules/dailyCheckins';
import * as Sentry from '@sentry/browser';

export default function CheckinAddPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const handleSubmit = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/dailyCheckins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        // Check if it's a conflict error (existing check-in for today)
        if (response.status === 409) {
          const errorData = await response.json();
          if (errorData.existingCheckin) {
            // Redirect to edit the existing check-in instead
            navigate(`/daily-checkins/edit/${errorData.existingCheckin.id}`);
            return;
          }
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add check-in');
      }
      
      navigate('/daily-checkins');
    } catch (err) {
      console.error('Error adding check-in:', err);
      Sentry.captureException(err);
      setError('Failed to add check-in. Please try again.');
      throw err; // Re-throw to let the form component handle it
    }
  };
  
  const handleCancel = () => {
    navigate('/daily-checkins');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Daily Check-in</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <CheckinForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}