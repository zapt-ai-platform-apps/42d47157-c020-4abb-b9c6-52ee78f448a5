import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReportViewer } from '@/modules/reports';
import * as Sentry from '@sentry/browser';

export default function ReportViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`/api/reports?id=${id}&data=true`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report data:', err);
        Sentry.captureException(err);
        setError('Failed to load report data. Please try again later.');
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