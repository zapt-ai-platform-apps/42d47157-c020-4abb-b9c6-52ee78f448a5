import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SideEffectForm } from '../src/modules/sideEffects';

// Mock dependencies
vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));

// Mock data for testing
const mockMedications = [
  { id: '1060514617554862100', name: 'Medication 1', dosage: '10mg' },
  { id: '2', name: 'Medication 2', dosage: '20mg' },
];

describe('SideEffectForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('handles large medication IDs correctly', async () => {
    render(
      <MemoryRouter>
        <SideEffectForm 
          medications={mockMedications}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Side Effect \/ Symptom/i), { 
      target: { value: 'Headache' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Severity/i), { 
      target: { value: '7' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add side effect/i }));
    
    await waitFor(() => {
      // Check that onSubmit was called with the medication ID as a string
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      
      // Get the first argument of the first call
      const payload = mockOnSubmit.mock.calls[0][0];
      
      // Check that the medicationId is passed as a string
      expect(typeof payload.medicationId).toBe('string');
      
      // Verify the exact value matches
      expect(payload.medicationId).toBe('1060514617554862100');
    });
  });

  test('shows validation error when no symptom is entered', async () => {
    render(
      <MemoryRouter>
        <SideEffectForm 
          medications={mockMedications}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </MemoryRouter>
    );
    
    // Leave symptom field empty
    fireEvent.change(screen.getByLabelText(/Side Effect \/ Symptom/i), { 
      target: { value: '' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add side effect/i }));
    
    // Validation should prevent submit and show error
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/please describe the side effect/i)).toBeInTheDocument();
    });
  });
});