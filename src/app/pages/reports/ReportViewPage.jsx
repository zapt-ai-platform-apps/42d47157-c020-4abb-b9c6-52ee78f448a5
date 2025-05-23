import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReportViewer } from '@/modules/reports';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function ReportViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const reportId = String(id).trim();
        console.log(`Attempting to fetch report with ID: ${reportId}`);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('No active session');
        }
        
        const response = await fetch(`/api/reports?id=${reportId}&data=true`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        if (!response.ok) {
          // Get detailed error information
          let errorMessage = `Failed to fetch report data (status: ${response.status})`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            // If we can't parse JSON, try getting error as text
            try {
              const errorText = await response.text();
              console.error('API response error text:', errorText);
            } catch (textError) {
              console.error('Could not read error response body');
            }
          }
          
          console.error('API response error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Report data received:', {
          hasReport: !!data.report,
          medicationsCount: Array.isArray(data.medications) ? data.medications.length : 'not an array',
          sideEffectsCount: Array.isArray(data.sideEffects) ? data.sideEffects.length : 'not an array',
          checkinsCount: Array.isArray(data.checkins) ? data.checkins.length : 'not an array'
        });
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report data:', err);
        Sentry.captureException(err);
        
        // Provide a more user-friendly error message
        let userMessage = 'Failed to load report data. Please try again later.';
        if (err.message === 'Report not found' || err.message === 'Report not found for your account') {
          userMessage = 'This report could not be found. It may have been deleted or may not be associated with your account.';
        } else if (err.message === 'No active session') {
          userMessage = 'Your session has expired. Please log in again.';
        }
        
        setError(userMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);
  
  const handleBack = () => {
    navigate('/reports');
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading report data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">View Report</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
        <button 
          onClick={handleBack}
          className="btn-secondary cursor-pointer"
        >
          Back to Reports
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <ReportViewer 
        reportData={reportData}
        onBack={handleBack}
      />
    </div>
  );
}