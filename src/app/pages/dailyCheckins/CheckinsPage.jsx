import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckinList } from '@/modules/dailyCheckins';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchCheckins();
  }, []);
  
  const fetchCheckins = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
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
      setCheckins(data);
    } catch (err) {
      console.error('Error fetching daily check-ins:', err);
      Sentry.captureException(err);
      setError('Failed to load daily check-ins. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (checkin) => {
    // Navigate to edit page
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this check-in?')) {
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/dailyCheckins?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete check-in');
      }
      
      setCheckins(checkins.filter(checkin => checkin.id !== id));
    } catch (err) {
      console.error('Error deleting check-in:', err);
      Sentry.captureException(err);
      setError('Failed to delete check-in. Please try again.');
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Check-ins</h1>
        <Link to="/daily-checkins/add" className="btn-primary cursor-pointer">
          New Check-in
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
          <p className="mt-2 text-gray-500">Loading check-ins...</p>
        </div>
      ) : (
        <CheckinList 
          checkins={checkins}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}