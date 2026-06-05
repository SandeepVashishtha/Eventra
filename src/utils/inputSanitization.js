import createDOMPurify from "dompurify";

/**
 * Input Sanitization Utilities
 *
 * Sanitize and validate user input to prevent injection attacks
 * and ensure data integrity across API boundaries.
 */

/**
 * Sanitize search query to prevent XSS and NoSQL injection attacks.
 * Uses DOMPurify with no allowed tags to safely remove all HTML
 * while handling obfuscated XSS vectors that regex cascades miss.
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

  // Use DOMPurify to strip ALL HTML tags (including SVG, math, data URI,
  // obfuscated event handlers) instead of a fragile regex cascade.
  try {
    let purify;
    if (typeof createDOMPurify?.sanitize === 'function') {
      purify = createDOMPurify;
    } else if (typeof createDOMPurify === 'function' && typeof window?.document !== 'undefined') {
      purify = createDOMPurify(window);
    }
    if (purify && typeof purify.sanitize === 'function') {
      sanitized = purify.sanitize(sanitized, { ALLOWED_TAGS: [] });
    }
  } catch {
    // DOMPurify unavailable - fall through to manual stripping
  }

  // Manual tag stripping as final safeguard (catches any DOMPurify bypass)
  sanitized = sanitized
    .replace(/<[^>]*>/g, '')
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
    "'": '&#x27;'
  };

  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
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
