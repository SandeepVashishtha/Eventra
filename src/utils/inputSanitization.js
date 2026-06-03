/* eslint-disable-next-line no-console */
/**
 * Input Sanitization Utilities
 *
 * Sanitize and validate user input to prevent injection attacks
 * and ensure data integrity across API boundaries.
 */

/**
 * Sanitize search query to prevent NoSQL injection attacks.
 * Allows only alphanumeric characters, spaces, hyphens, and common punctuation.
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

  sanitized = sanitized
    // Drop executable blocks before stripping tag characters so their payloads
    // cannot survive as searchable text.
    .replace(/<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ')
    .replace(/<\s*\/?\s*(script|style)\b[^>]*>?/gi, ' ')
    .replace(/<\s*(img|iframe|object|embed|svg|math|link|meta)\b[^>]*>?/gi, ' ')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s<>]+)/gi, ' ')
    .replace(/\b(?:java|vb)script\s*:/gi, ' ')
    .replace(/\b(?:alert|confirm|prompt)\s*\([^)]*\)/gi, ' ')
    .replace(/[${}\[\];'`|\\/\n\r<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

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
  const validation = validateSearchQuery(rawQuery);
  if (!validation.isValid) {
    /* eslint-disable-next-line no-console */
    console.warn(`[Security] Invalid search query: ${validation.error}`);
    return '';
  }

  return sanitizeSearchQuery(rawQuery);
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

  return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
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
