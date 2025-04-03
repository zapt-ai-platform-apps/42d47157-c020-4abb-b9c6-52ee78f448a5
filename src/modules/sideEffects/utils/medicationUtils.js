import * as Sentry from '@sentry/browser';

/**
 * Validates if a medication ID is in the correct format
 * @param {any} id - The medication ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export const isValidMedicationId = (id) => {
  // Check if it's a Date object or has Date methods
  if (id instanceof Date || 
      (typeof id === 'object' && id !== null && 'toISOString' in id)) {
    console.error('Invalid medication ID: Date object detected:', id);
    return false;
  }

  // Check if it's a string or number that can be parsed
  if (typeof id !== 'string' && typeof id !== 'number') {
    console.error('Invalid medication ID type:', typeof id);
    return false;
  }

  // Ensure it can be parsed as a number
  try {
    if (isNaN(Number(id))) {
      console.error('Medication ID is not a valid number:', id);
      return false;
    }
  } catch (err) {
    console.error('Error parsing medication ID:', err);
    return false;
  }

  return true;
};

/**
 * Sanitizes a medication ID to ensure it's in a valid format
 * @param {any} id - The medication ID to sanitize
 * @returns {string} - A valid string representation of the ID
 */
export const sanitizeMedicationId = (id) => {
  // Check for Date objects
  if (id instanceof Date || 
      (typeof id === 'object' && id !== null && 'toISOString' in id)) {
    console.error('Found Date object as medication ID:', id);
    Sentry.captureException(new Error(`Date object received as medication ID: ${id}`));
    // Return a random string ID as fallback
    return String(Date.now());
  }
  
  // Ensure ID is a string or number
  if (typeof id !== 'string' && typeof id !== 'number') {
    console.error('Invalid medication ID type:', typeof id);
    Sentry.captureException(new Error(`Invalid medication ID type: ${typeof id}`));
    return String(Math.floor(Math.random() * 1000000));
  }
  
  // Return as string for consistency
  return String(id);
};

/**
 * Sanitizes an array of medications to ensure all IDs are valid
 * @param {Array} medications - Array of medication objects
 * @returns {Array} - Array with sanitized medication IDs
 */
export const sanitizeMedications = (medications) => {
  if (!Array.isArray(medications)) {
    console.error('Expected medications to be an array, got:', typeof medications);
    return [];
  }
  
  return medications.map(med => ({
    ...med,
    id: sanitizeMedicationId(med.id)
  }));
};