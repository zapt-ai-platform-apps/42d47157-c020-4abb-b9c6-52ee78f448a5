import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportList } from '@/modules/reports';
import ConfirmDialog from '@/modules/core/components/ConfirmDialog';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  
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
  
  const confirmDeleteReport = (id) => {
    if (deletingId !== null) return; // Prevent actions while deletion is in progress
    
    // Find the report title for more context in the confirmation
    const report = reports.find(report => report.id === id);
    setReportToDelete(report);
    setConfirmDelete(true);
  };
  
  const handleDelete = async () => {
    if (deletingId !== null || !reportToDelete) return;
    
    try {
      setDeletingId(reportToDelete.id);
      setError(''); // Clear any previous errors
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log(`Attempting to delete report with ID: ${reportToDelete.id}`);
      
      const response = await fetch(`/api/reports?id=${reportToDelete.id}`, {
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
      setReports(reports.filter(report => report.id !== reportToDelete.id));
    } catch (err) {
      console.error('Error deleting report:', err);
      Sentry.captureException(err);
      setError(err.message || 'Failed to delete report. Please try again.');
    } finally {
      setDeletingId(null);
      setReportToDelete(null);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctor Reports</h1>
        <button
          onClick={() => navigate('/reports/create')}
          className="btn-primary cursor-pointer"
          disabled={deletingId !== null}
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
          onDelete={confirmDeleteReport}
          deletingId={deletingId}
        />
      )}
      
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Report"
        message={`Are you sure you want to delete "${reportToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  );
}