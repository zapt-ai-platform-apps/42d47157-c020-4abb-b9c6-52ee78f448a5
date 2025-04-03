import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideEffectForm } from '@/modules/sideEffects';
import * as Sentry from '@sentry/browser';

export default function SideEffectAddPage() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [loadingMedications, setLoadingMedications] = useState(true);
  const [error, setError] = useState('');
  
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
          throw new Error('Failed to fetch medications');
        }
        
        const data = await response.json();
        setMedications(data);
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/sideEffects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add side effect');
      }
      
      navigate('/side-effects');
    } catch (err) {
      console.error('Error adding side effect:', err);
      Sentry.captureException(err);
      setError('Failed to add side effect. Please try again.');
      throw err; // Re-throw to let the form component handle it
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
        
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
          <p>You need to add medications before you can record side effects.</p>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => navigate('/medications/add')}
            className="btn-primary cursor-pointer"
          >
            Add Your First Medication
          </button>
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