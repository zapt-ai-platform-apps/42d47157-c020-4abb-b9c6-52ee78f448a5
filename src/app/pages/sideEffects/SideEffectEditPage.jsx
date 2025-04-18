import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SideEffectForm } from '@/modules/sideEffects';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

// Helper function to sanitize medication IDs
const sanitizeMedicationId = (id) => {
  // Check for Date objects
  if (id instanceof Date || 
      (typeof id === 'object' && id !== null && 'toISOString' in id)) {
    console.error('Found Date object as medication ID:', id);
    Sentry.captureException(new Error(`Date object received as medication ID: ${id}`));
    // Return a random string ID as fallback
    return String(Date.now());
  }
  
  // Ensure ID is a string or number
  if (typeof id !== 'string' && typeof id !== 'number') {
    console.error('Invalid medication ID type:', typeof id);
    Sentry.captureException(new Error(`Invalid medication ID type: ${typeof id}`));
    return String(Math.floor(Math.random() * 1000000));
  }
  
  // Return as string for consistency
  return String(id);
};

export default function SideEffectEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sideEffect, setSideEffect] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Fetch medications
        const medsResponse = await fetch('/api/medications', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        
        if (!medsResponse.ok) {
          const errorText = await medsResponse.text();
          console.error('API response error (medications):', errorText);
          throw new Error('Failed to fetch medications');
        }
        
        const medsData = await medsResponse.json();
        
        // Sanitize all medication IDs
        const sanitizedMedications = medsData.map(med => ({
          ...med,
          id: sanitizeMedicationId(med.id)
        }));
        
        setMedications(sanitizedMedications);
        
        // Fetch all side effects and find the one with the matching ID
        const effectsResponse = await fetch('/api/sideEffects', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        
        if (!effectsResponse.ok) {
          const errorText = await effectsResponse.text();
          console.error('API response error (side effects):', errorText);
          throw new Error('Failed to fetch side effects');
        }
        
        const effectsData = await effectsResponse.json();
        const effect = effectsData.find(e => e.id === parseInt(id));
        
        if (!effect) {
          throw new Error('Side effect not found');
        }
        
        // Sanitize the side effect's medication ID
        const sanitizedEffect = {
          ...effect,
          medicationId: sanitizeMedicationId(effect.medicationId)
        };
        
        console.log('Sanitized side effect medication ID:', sanitizedEffect.medicationId);
        setSideEffect(sanitizedEffect);
      } catch (err) {
        console.error('Error fetching data:', err);
        Sentry.captureException(err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleSubmit = async (formData) => {
    try {
      // Sanitize the medicationId one more time before submission
      const sanitizedFormData = {
        ...formData,
        medicationId: sanitizeMedicationId(formData.medicationId),
        severity: Number(formData.severity)
      };
      
      console.log('Submitting updated side effect with medication ID:', sanitizedFormData.medicationId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/sideEffects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(sanitizedFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || 'Failed to update side effect');
      }
      
      navigate('/side-effects');
    } catch (err) {
      console.error('Error updating side effect:', err);
      Sentry.captureException(err);
      setError('Failed to update side effect. Please try again.');
      throw err; // Re-throw to let the form component handle it
    }
  };
  
  const handleCancel = () => {
    navigate('/side-effects');
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading data...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Side Effect</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {sideEffect ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <SideEffectForm 
            sideEffect={sideEffect}
            medications={medications}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Side effect not found. It may have been deleted.
        </div>
      )}
    </div>
  );
}