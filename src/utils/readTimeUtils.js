/**
 * Calculate estimated read time for text content
 * Based on average reading speed of 200 words per minute
 * @param {string} text - The text content to analyze
 * @returns {number} - Estimated read time in minutes
 */
export const calculateReadTime = (text) => {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Remove HTML tags if present
  const plainText = text.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace and filter empty strings)
  const wordCount = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  
  // Calculate read time in minutes (round up)
  const readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  
  // Minimum 1 minute for any content
  return Math.max(1, readTimeMinutes);
};

/**
 * Format read time for display
 * @param {number} minutes - Read time in minutes
 * @returns {string} - Formatted string (e.g., "2 min read")
 */
export const formatReadTime = (minutes) => {
  if (minutes <= 0) return '';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};

/**
 * Get read time info for an event
 * @param {Object} event - Event object with description
 * @returns {{minutes: number, display: string}} - Read time info
 */
export const getEventReadTime = (event) => {
  const description = event?.description || '';
  const minutes = calculateReadTime(description);
  const plainText = description.replace(/<[^>]*>/g, '').trim();

  return {
    minutes,
    display: formatReadTime(minutes),
    wordCount: plainText.split(/\s+/).filter(word => word.length > 0).length,
  };
};
