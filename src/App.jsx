import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import {
  AuthProvider,
  ProtectedRoute,
  PublicRoute,
} from './modules/auth';
import Layout from './app/components/Layout';
import {
  DashboardPage,
  LoginPage,
  MedicationsPage,
  MedicationAddPage,
  MedicationEditPage,
  SideEffectsPage,
  SideEffectAddPage,
  SideEffectEditPage,
  CheckinsPage,
  CheckinAddPage,
  CheckinEditPage,
  ReportsPage,
  ReportCreatePage,
  ReportViewPage
} from './app/pages';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Medications routes */}
        <Route path="/medications" element={
          <ProtectedRoute>
            <Layout>
              <MedicationsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/medications/add" element={
          <ProtectedRoute>
            <Layout>
              <MedicationAddPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/medications/edit/:id" element={
          <ProtectedRoute>
            <Layout>
              <MedicationEditPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Side effects routes */}
        <Route path="/side-effects" element={
          <ProtectedRoute>
            <Layout>
              <SideEffectsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/side-effects/add" element={
          <ProtectedRoute>
            <Layout>
              <SideEffectAddPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/side-effects/edit/:id" element={
          <ProtectedRoute>
            <Layout>
              <SideEffectEditPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Daily check-ins routes */}
        <Route path="/daily-checkins" element={
          <ProtectedRoute>
            <Layout>
              <CheckinsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/daily-checkins/add" element={
          <ProtectedRoute>
            <Layout>
              <CheckinAddPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/daily-checkins/edit/:id" element={
          <ProtectedRoute>
            <Layout>
              <CheckinEditPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Reports routes */}
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/create" element={
          <ProtectedRoute>
            <Layout>
              <ReportCreatePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/view/:id" element={
          <ProtectedRoute>
            <Layout>
              <ReportViewPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Redirect all other routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}