
/**
 * Input Sanitization Utilities
 *
 * Sanitize and validate user input to prevent injection attacks
 * and ensure data integrity across API boundaries.
 */

/**
 * Sanitize search query to prevent XSS and NoSQL injection attacks.
 *
 * @param {string} query - The raw search query from user input
 * @returns {string} - Sanitized query safe for API transmission
 */
export const sanitizeSearchQuery = (query = '') => {
  if (typeof query !== 'string') {
    return '';
  }

  const MAX_QUERY_LENGTH = 200;

  let sanitized = query.trim();

  // Strip script tags and their content (closed or open-ended)
  sanitized = sanitized.replace(/<script\b[^>]*>(?:[\s\S]*?<\/script>|[\s\S]*)/gi, ' ');

  // Strip img tags (closed or open-ended)
  sanitized = sanitized.replace(/<img\b[^>]*>?/gi, ' ');

  // Strip javascript: links
  sanitized = sanitized.replace(/javascript:[^\s]*/gi, ' ');

  // Remove all other < and > characters
  sanitized = sanitized.replace(/[<>]/g, '');

  // Remove other disallowed characters completely (replaced with empty string)
  sanitized = sanitized.replace(/[${}\[\];'`|\\/\n\r]/g, '');

  // Collapse spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Ensure max length to prevent ReDoS attacks
  if (sanitized.length > MAX_QUERY_LENGTH) {
    sanitized = sanitized.substring(0, MAX_QUERY_LENGTH).trim();
  }

  return sanitized;
};

/**
 * Validate search query length and format.
 *
 * @param {string} query - The search query to validate
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export const validateSearchQuery = (query = '') => {
  if (typeof query !== 'string') {
    return { isValid: false, error: 'Search query must be a string' };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { isValid: true, error: null }; // Empty is valid (return all results)
  }

  if (trimmed.length > 200) {
    return { isValid: false, error: 'Search query must be less than 200 characters' };
  }

  // Check for obvious injection patterns
  const hasInjectionPatterns = /[\$\{\}\[\];'`|\\]/.test(trimmed);
  if (hasInjectionPatterns) {
    return { isValid: false, error: 'Search query contains invalid characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Safe search query preparation for API calls.
 * Combines sanitization and validation.
 *
 * @param {string} rawQuery - Raw user input
 * @returns {string} - Safe query for API, or empty string if invalid
 */
export const prepareSafeSearchQuery = (rawQuery = '') => {
  if (typeof rawQuery === 'string' && rawQuery.length > 200) {
    console.warn(`[Security] Invalid search query after sanitization: Search query must be less than 200 characters`);
    return '';
  }

  const validation = validateSearchQuery(rawQuery);
  if (!validation.isValid) {
    console.warn(`[Security] Invalid search query after sanitization: ${validation.error}`);
    return '';
  }

  const sanitized = sanitizeSearchQuery(rawQuery);
  return sanitized;
};

/**
 * Sanitize plain user text input.
 * Strips HTML tags entirely and entity-escapes special characters to prevent XSS.
 *
 * @param {string} text - Raw input text from the UI
 * @returns {string} - Clean, safe plain-text
 */
export const sanitizeInputText = (text = '') => {
  if (typeof text !== 'string') {
    return '';
  }

  // Escape HTML special characters for absolute safety
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return text.replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
};

/**
 * Strip all HTML tags from a text string.
 * Faster than full DOMPurify when only raw text is needed.
 *
 * @param {string} text - Raw input text
 * @returns {string} - Text with HTML tags stripped
 */
export const stripHtmlTags = (text = '') => {
  if (typeof text !== 'string') {
    return '';
  }
  return text.replace(/<[^>]*>?/gm, '');
};
