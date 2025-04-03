import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportsPage from '../src/app/pages/reports/ReportsPage';
import * as SupabaseClient from '../src/supabaseClient';

// Mock supabase
vi.mock('../src/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      })
    }
  },
  recordLogin: vi.fn()
}));

// Mock fetch
const mockFetch = (status, data) => {
  global.fetch = vi.fn().mockImplementation(() => 
    Promise.resolve({
      ok: status === 200,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    })
  );
};

// Mock Sentry
vi.mock('@sentry/browser', () => ({
  captureException: vi.fn()
}));

// Mock router navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock ReportList component
vi.mock('@/modules/reports', () => ({
  ReportList: ({ reports, onView, onDelete }) => (
    <div data-testid="report-list">
      {reports.map(report => (
        <div key={report.id} data-testid={`report-${report.id}`}>
          {report.title}
          <button onClick={() => onView(report.id)} data-testid={`view-${report.id}`}>View</button>
          <button onClick={() => onDelete(report.id)} data-testid={`delete-${report.id}`}>Delete</button>
        </div>
      ))}
    </div>
  )
}));

// Mock window.confirm
global.confirm = vi.fn();

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays reports', async () => {
    const mockReports = [
      { id: 1, title: 'Report 1', startDate: '2023-01-01', endDate: '2023-01-31', createdAt: '2023-01-15' },
      { id: 2, title: 'Report 2', startDate: '2023-02-01', endDate: '2023-02-28', createdAt: '2023-02-15' }
    ];
    
    mockFetch(200, mockReports);
    
    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );
    
    expect(await screen.findByText('Doctor Reports')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reports', {
        headers: { Authorization: 'Bearer test-token' }
      });
    });
  });
  
  it('shows error message when loading reports fails', async () => {
    mockFetch(500, { error: 'Server error' });
    
    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );
    
    expect(await screen.findByText('Failed to load reports. Please try again later.')).toBeInTheDocument();
  });
  
  it('handles report deletion correctly', async () => {
    // Mock initial load of reports
    const mockReports = [
      { id: 1, title: 'Report 1', startDate: '2023-01-01', endDate: '2023-01-31', createdAt: '2023-01-15' }
    ];
    mockFetch(200, mockReports);
    
    // Setup confirmation to return true
    global.confirm.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('report-list')).toBeInTheDocument();
    });
    
    // Now setup the delete response
    mockFetch(200, { success: true });
    
    // Click delete
    fireEvent.click(screen.getByTestId('delete-1'));
    
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this report?');
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reports?id=1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer test-token' }
      });
    });
  });
  
  it('handles report deletion error correctly', async () => {
    // Mock initial load of reports
    const mockReports = [
      { id: 1, title: 'Report 1', startDate: '2023-01-01', endDate: '2023-01-31', createdAt: '2023-01-15' }
    ];
    mockFetch(200, mockReports);
    
    // Setup confirmation to return true
    global.confirm.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('report-list')).toBeInTheDocument();
    });
    
    // Now setup the delete response to fail
    mockFetch(404, { error: 'Report not found or does not belong to user' });
    
    // Click delete
    fireEvent.click(screen.getByTestId('delete-1'));
    
    // Check for error message
    expect(await screen.findByText('Report not found or does not belong to user')).toBeInTheDocument();
  });
});