/**
 * Get today's date as YYYY-MM-DD string
 * @returns {string} Today's date in ISO format (YYYY-MM-DD)
 */
export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Calculate the difference in days between two date strings
 * @param {string} dateStr1 - First date in YYYY-MM-DD format
 * @param {string} dateStr2 - Second date in YYYY-MM-DD format
 * @returns {number} Number of days between the two dates
 */
export const daysDiff = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};
