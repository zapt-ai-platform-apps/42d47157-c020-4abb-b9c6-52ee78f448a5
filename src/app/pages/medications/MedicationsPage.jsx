import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MedicationList } from '@/modules/medications';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchMedications();
  }, []);
  
  const fetchMedications = async () => {
    try {
      setLoading(true);
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
      setMedications(data);
    } catch (err) {
      console.error('Error fetching medications:', err);
      Sentry.captureException(err);
      setError('Failed to load medications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (medication) => {
    // Navigate to edit page
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) {
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/medications?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete medication');
      }
      
      setMedications(medications.filter(med => med.id !== id));
    } catch (err) {
      console.error('Error deleting medication:', err);
      Sentry.captureException(err);
      setError('Failed to delete medication. Please try again.');
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Medications</h1>
        <Link to="/medications/add" className="btn-primary cursor-pointer">
          Add Medication
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-2 text-gray-500">Loading medications...</p>
        </div>
      ) : (
        <MedicationList 
          medications={medications}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}