/**
 * Ensures consistent date formatting for database operations
 * @param {string|Date} dateValue - The date value to format
 * @returns {string|null} A date string in YYYY-MM-DD format or null if no date provided
 */
export const formatDateForDB = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a string in ISO format, return it
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateValue;
  }
  
  // Otherwise, ensure it's converted to YYYY-MM-DD format
  const date = new Date(dateValue);
  return date.toISOString().split('T')[0];
};