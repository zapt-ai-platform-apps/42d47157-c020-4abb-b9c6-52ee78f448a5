import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportForm } from '@/modules/reports';
import { UpgradeModal } from '@/modules/subscriptions';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function ReportCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);
  
  const checkSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/reports', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }
      
      const data = await response.json();
      setSubscription(data.subscription);
      
      if (!data.subscription.canCreateReport && !data.subscription.hasActiveSubscription) {
        setShowUpgradeModal(true);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      Sentry.captureException(err);
      setError('Failed to check subscription status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        if (response.status === 403 && responseData.subscription) {
          // User has reached their report limit
          setSubscription(responseData.subscription);
          setShowUpgradeModal(true);
          throw new Error('Report limit reached');
        }
        
        throw new Error(responseData.error || 'Failed to create report');
      }
      
      navigate(`/reports/view/${responseData.id}`);
    } catch (err) {
      if (err.message !== 'Report limit reached') {
        console.error('Error creating report:', err);
        Sentry.captureException(err);
        setError('Failed to create report. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/reports');
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Doctor Report</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {(!subscription?.canCreateReport && !subscription?.hasActiveSubscription) ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">Report Limit Reached</h2>
          <p className="text-yellow-700 mb-4">
            You've used all {subscription?.limit} reports available in the free plan. 
            Upgrade to the Standard Plan for unlimited reports.
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="btn-primary cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <ReportForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
      
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}