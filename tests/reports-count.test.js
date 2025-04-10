import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import DashboardPage from '../src/app/pages/DashboardPage';
import { MemoryRouter } from 'react-router-dom';

// Mock the auth context
vi.mock('@/modules/auth', () => ({
  useAuthContext: () => ({ user: { id: 'test-user-id', email: 'test@example.com' } })
}));

// Mock supabase client
vi.mock('@/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: { access_token: 'test-token' } } })
    }
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('DashboardPage Reports Count', () => {
  beforeEach(() => {
    fetch.mockReset();
    
    // Mock medication response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Test Med' }])
      })
    );
    
    // Mock side effects response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, symptom: 'Test Symptom' }])
      })
    );
    
    // Mock check-ins response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, date: '2023-01-01' }])
      })
    );
  });

  it('should display the reports count correctly when API returns reports object', async () => {
    // Mock reports response with the structure returned by the API
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          reports: [
            { id: '1', title: 'Report 1' },
            { id: '2', title: 'Report 2' },
            { id: '3', title: 'Report 3' }
          ],
          subscription: { hasActiveSubscription: false }
        })
      })
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Wait for the reports count to be updated
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should handle empty reports correctly', async () => {
    // Mock reports response with empty reports array
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          reports: [],
          subscription: { hasActiveSubscription: false }
        })
      })
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Wait for the reports count to be updated
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('should handle API error correctly', async () => {
    // Mock reports API error
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('API error'))
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Wait for the error handling to complete
    await waitFor(() => {
      // Should still display 0 for reports count after error
      const countElements = screen.getAllByText('0');
      expect(countElements.length).toBeGreaterThan(0);
    });
  });
});