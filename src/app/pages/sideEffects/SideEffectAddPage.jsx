import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

export default function SideEffectAddPage() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [loadingMedications, setLoadingMedications] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchMedications = async () => {
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
          throw new Error('Failed to fetch medications');
        }
        
        const data = await response.json();
        
        // Sanitize all medication IDs before setting state
        const sanitizedMedications = data.map(med => ({
          ...med,
          id: sanitizeMedicationId(med.id)
        }));
        
        console.log(`Fetched ${sanitizedMedications.length} medications with IDs:`, 
                   sanitizedMedications.map(med => `${med.id} (${typeof med.id})`));
        
        setMedications(sanitizedMedications);
      } catch (err) {
        console.error('Error fetching medications:', err);
        Sentry.captureException(err);
        setError('Failed to load medications. Please try again later.');
      } finally {
        setLoadingMedications(false);
      }
    };
    
    fetchMedications();
  }, []);
  
  const handleSubmit = async (formData) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      if (!formData.medicationId) {
        throw new Error('Please select a medication');
      }
      
      console.log('Submitting side effect with medication ID (from page):', formData.medicationId);
      console.log('Medication ID type:', typeof formData.medicationId);
      
      // Sanitize the medication ID one more time before submission
      const sanitizedMedicationId = sanitizeMedicationId(formData.medicationId);
      
      // Create a sanitized copy of the form data
      const sanitizedFormData = {
        ...formData,
        medicationId: sanitizedMedicationId,
        severity: Number(formData.severity)
      };
      
      console.log('Sending payload with sanitized medication ID:', sanitizedFormData.medicationId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/sideEffects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(sanitizedFormData)
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        const errorMessage = responseData.error || 'Failed to add side effect';
        console.error('Server error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Successfully added side effect:', data);
      navigate('/side-effects');
    } catch (err) {
      console.error('Error adding side effect:', err);
      Sentry.captureException(err);
      setError(err.message || 'Failed to add side effect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/side-effects');
  };
  
  if (loadingMedications) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading medications...</p>
      </div>
    );
  }
  
  if (medications.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Record Side Effect</h1>
        
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-2">No Medications Found</h2>
          <p className="mb-4">You need to add at least one medication before you can record side effects.</p>
          <Link 
            to="/medications/add"
            className="btn-primary cursor-pointer inline-block"
          >
            Add Your First Medication
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Record Side Effect</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <SideEffectForm 
          medications={medications}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}