import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportList } from '@/modules/reports';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/reports', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', errorText);
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      Sentry.captureException(err);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleView = (id) => {
    navigate(`/reports/view/${id}`);
  };
  
  const handleDelete = async (id) => {
    if (isDeleting) return; // Prevent multiple clicks
    
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setError(''); // Clear any previous errors
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log(`Attempting to delete report with ID: ${id}`);
      
      const response = await fetch(`/api/reports?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Delete report response error:', response.status, responseData);
        throw new Error(responseData.error || 'Failed to delete report');
      }
      
      console.log('Report deleted successfully');
      setReports(reports.filter(report => report.id !== id));
    } catch (err) {
      console.error('Error deleting report:', err);
      Sentry.captureException(err);
      setError(err.message || 'Failed to delete report. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctor Reports</h1>
        <button
          onClick={() => navigate('/reports/create')}
          className="btn-primary cursor-pointer"
          disabled={isDeleting}
        >
          Create New Report
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-2 text-gray-500">Loading reports...</p>
        </div>
      ) : (
        <ReportList 
          reports={reports}
          onView={handleView}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}