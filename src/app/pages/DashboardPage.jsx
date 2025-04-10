import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/modules/auth';
import { format } from 'date-fns';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    medications: { count: 0, loading: true },
    sideEffects: { count: 0, loading: true },
    checkins: { count: 0, loading: true },
    reports: { count: 0, loading: true }
  });
  const [recentSideEffects, setRecentSideEffects] = useState([]);
  const [loadingRecentSideEffects, setLoadingRecentSideEffects] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch medication count
        const { data: { session } } = await supabase.auth.getSession();
        
        const fetchMedications = fetch('/api/medications', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          setStats(prev => ({
            ...prev,
            medications: { count: data.length, loading: false }
          }));
        })
        .catch(error => {
          console.error('Error fetching medications:', error);
          Sentry.captureException(error);
          setStats(prev => ({
            ...prev,
            medications: { count: 0, loading: false }
          }));
        });
        
        // Fetch side effects count and recent items
        const fetchSideEffects = fetch('/api/sideEffects', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          setStats(prev => ({
            ...prev,
            sideEffects: { count: data.length, loading: false }
          }));
          // Get the 3 most recent side effects
          const recent = data.slice(0, 3);
          setRecentSideEffects(recent);
          setLoadingRecentSideEffects(false);
        })
        .catch(error => {
          console.error('Error fetching side effects:', error);
          Sentry.captureException(error);
          setStats(prev => ({
            ...prev,
            sideEffects: { count: 0, loading: false }
          }));
          setLoadingRecentSideEffects(false);
        });
        
        // Fetch check-ins count
        const fetchCheckins = fetch('/api/dailyCheckins', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          setStats(prev => ({
            ...prev,
            checkins: { count: data.length, loading: false }
          }));
        })
        .catch(error => {
          console.error('Error fetching check-ins:', error);
          Sentry.captureException(error);
          setStats(prev => ({
            ...prev,
            checkins: { count: 0, loading: false }
          }));
        });
        
        // Fetch reports count
        const fetchReports = fetch('/api/reports', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          // Fix: The reports API returns an object with a "reports" property
          setStats(prev => ({
            ...prev,
            reports: { count: data.reports.length, loading: false }
          }));
        })
        .catch(error => {
          console.error('Error fetching reports:', error);
          Sentry.captureException(error);
          setStats(prev => ({
            ...prev,
            reports: { count: 0, loading: false }
          }));
        });
        
        // Wait for all requests to complete
        await Promise.all([
          fetchMedications,
          fetchSideEffects,
          fetchCheckins,
          fetchReports
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        Sentry.captureException(error);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to SideTrack</h1>
        <p className="text-gray-600 mt-1">Track medication side effects and create doctor-ready reports</p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/medications/add" className="card bg-indigo-50 hover:bg-indigo-100 transition-colors">
          <h3 className="font-medium text-indigo-700">Add Medication</h3>
          <p className="text-sm text-indigo-600 mt-1">Log a new medication you're taking</p>
        </Link>
        <Link to="/side-effects/add" className="card bg-blue-50 hover:bg-blue-100 transition-colors">
          <h3 className="font-medium text-blue-700">Record Side Effect</h3>
          <p className="text-sm text-blue-600 mt-1">Track a symptom or side effect</p>
        </Link>
        <Link to="/daily-checkins/add" className="card bg-green-50 hover:bg-green-100 transition-colors">
          <h3 className="font-medium text-green-700">Daily Check-in</h3>
          <p className="text-sm text-green-600 mt-1">Log how you're feeling today</p>
        </Link>
        <Link to="/reports/create" className="card bg-purple-50 hover:bg-purple-100 transition-colors">
          <h3 className="font-medium text-purple-700">Create Report</h3>
          <p className="text-sm text-purple-600 mt-1">Generate a report for your doctor</p>
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700">Medications</h3>
          {stats.medications.loading ? (
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.medications.count}</p>
          )}
          <Link to="/medications" className="text-sm text-indigo-600 mt-2 inline-block">View all</Link>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700">Side Effects</h3>
          {stats.sideEffects.loading ? (
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.sideEffects.count}</p>
          )}
          <Link to="/side-effects" className="text-sm text-blue-600 mt-2 inline-block">View all</Link>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700">Check-ins</h3>
          {stats.checkins.loading ? (
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.checkins.count}</p>
          )}
          <Link to="/daily-checkins" className="text-sm text-green-600 mt-2 inline-block">View all</Link>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700">Reports</h3>
          {stats.reports.loading ? (
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.reports.count}</p>
          )}
          <Link to="/reports" className="text-sm text-purple-600 mt-2 inline-block">View all</Link>
        </div>
      </div>
      
      {/* Recent Side Effects */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Side Effects</h2>
        {loadingRecentSideEffects ? (
          <div className="space-y-4">
            <div className="animate-pulse h-24 bg-gray-100 rounded"></div>
            <div className="animate-pulse h-24 bg-gray-100 rounded"></div>
            <div className="animate-pulse h-24 bg-gray-100 rounded"></div>
          </div>
        ) : recentSideEffects.length > 0 ? (
          <div className="space-y-4">
            {recentSideEffects.map(effect => (
              <div key={effect.id} className="card">
                <div className="flex justify-between">
                  <h3 className="font-medium">{effect.symptom}</h3>
                  <span className={`badge ${effect.severity > 7 ? 'badge-red' : effect.severity > 4 ? 'badge-yellow' : 'badge-green'}`}>
                    Severity: {effect.severity}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(effect.date), 'MMM d, yyyy')} • {effect.timeOfDay}
                </p>
                <p className="text-sm text-gray-600">
                  Medication: {effect.medicationName || 'Unknown'}
                </p>
              </div>
            ))}
            <div className="text-right">
              <Link to="/side-effects" className="text-indigo-600 hover:text-indigo-800">
                View all side effects →
              </Link>
            </div>
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-500">You haven't recorded any side effects yet.</p>
            <Link to="/side-effects/add" className="mt-4 btn-primary inline-block cursor-pointer">
              Record Your First Side Effect
            </Link>
          </div>
        )}
      </div>
      
      {/* Quick Tips */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
        <div className="bg-blue-50 rounded-lg p-4 text-blue-800">
          <h3 className="font-medium mb-2">Getting the Most from SideTrack</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Record side effects as soon as you notice them</li>
            <li>Complete daily check-ins even when you feel fine</li>
            <li>Create reports before doctor appointments</li>
            <li>Track all medications, including over-the-counter drugs</li>
            <li>Note any pattern changes in your symptoms</li>
          </ul>
        </div>
      </div>
    </div>
  );
}