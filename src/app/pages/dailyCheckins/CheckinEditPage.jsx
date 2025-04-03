import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckinForm } from '@/modules/dailyCheckins';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function CheckinEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Fetch all check-ins and find the one with matching ID
        const response = await fetch('/api/dailyCheckins', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API response error:', errorText);
          throw new Error('Failed to fetch daily check-ins');
        }
        
        const data = await response.json();
        const foundCheckin = data.find(c => c.id === parseInt(id));
        
        if (!foundCheckin) {
          throw new Error('Check-in not found');
        }
        
        setCheckin(foundCheckin);
      } catch (err) {
        console.error('Error fetching check-in:', err);
        Sentry.captureException(err);
        setError('Failed to load check-in. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckin();
  }, [id]);
  
  const handleSubmit = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/dailyCheckins', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || 'Failed to update check-in');
      }
      
      navigate('/daily-checkins');
    } catch (err) {
      console.error('Error updating check-in:', err);
      Sentry.captureException(err);
      setError('Failed to update check-in. Please try again.');
      throw err; // Re-throw to let the form component handle it
    }
  };
  
  const handleCancel = () => {
    navigate('/daily-checkins');
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading check-in...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Daily Check-in</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {checkin ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <CheckinForm 
            checkin={checkin}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Check-in not found. It may have been deleted.
        </div>
      )}
    </div>
  );
}