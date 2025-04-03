import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SideEffectList } from '@/modules/sideEffects';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function SideEffectsPage() {
  const [sideEffects, setSideEffects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchSideEffects();
  }, []);
  
  const fetchSideEffects = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/sideEffects', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', errorText);
        throw new Error('Failed to fetch side effects');
      }
      
      const data = await response.json();
      setSideEffects(data);
    } catch (err) {
      console.error('Error fetching side effects:', err);
      Sentry.captureException(err);
      setError('Failed to load side effects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (sideEffect) => {
    // Navigate to edit page
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this side effect?')) {
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/sideEffects?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete side effect');
      }
      
      setSideEffects(sideEffects.filter(effect => effect.id !== id));
    } catch (err) {
      console.error('Error deleting side effect:', err);
      Sentry.captureException(err);
      setError('Failed to delete side effect. Please try again.');
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Side Effects</h1>
        <Link to="/side-effects/add" className="btn-primary cursor-pointer">
          Record Side Effect
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
          <p className="mt-2 text-gray-500">Loading side effects...</p>
        </div>
      ) : (
        <SideEffectList 
          sideEffects={sideEffects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}