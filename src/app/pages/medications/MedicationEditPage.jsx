import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MedicationForm } from '@/modules/medications';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function MedicationEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch('/api/medications', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API response error:', errorText);
          throw new Error('Failed to fetch medication');
        }
        
        const data = await response.json();
        const med = data.find(m => m.id === parseInt(id));
        
        if (!med) {
          throw new Error('Medication not found');
        }
        
        setMedication(med);
      } catch (err) {
        console.error('Error fetching medication:', err);
        Sentry.captureException(err);
        setError('Failed to load medication. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedication();
  }, [id]);
  
  const handleSubmit = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/medications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || 'Failed to update medication');
      }
      
      navigate('/medications');
    } catch (err) {
      console.error('Error updating medication:', err);
      Sentry.captureException(err);
      setError('Failed to update medication. Please try again.');
      throw err; // Re-throw to let the form component handle it
    }
  };
  
  const handleCancel = () => {
    navigate('/medications');
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading medication details...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Medication</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {medication ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <MedicationForm 
            medication={medication}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Medication not found. It may have been deleted.
        </div>
      )}
    </div>
  );
}