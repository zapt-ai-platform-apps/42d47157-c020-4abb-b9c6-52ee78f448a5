import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicationForm } from '@/modules/medications';
import * as Sentry from '@sentry/browser';

export default function MedicationAddPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const handleSubmit = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add medication');
      }
      
      navigate('/medications');
    } catch (err) {
      console.error('Error adding medication:', err);
      Sentry.captureException(err);
      setError('Failed to add medication. Please try again.');
      throw err; // Re-throw to let the form component handle it
    }
  };
  
  const handleCancel = () => {
    navigate('/medications');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Medication</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <MedicationForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}