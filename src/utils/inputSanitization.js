/* eslint-disable-next-line no-console */
/**
 * Input Sanitization Utilities
 *
 * Sanitize and validate user input to prevent injection attacks
 * and ensure data integrity across API boundaries.
 */

// Single-pass regex targeting all disallowed characters.
// Blocks NoSQL operators ($), object/array notation ({}, []), quotes/backticks ('"`),
// pipes/statements (|;\), HTML tags (<>), and newline/carriage controls.
const DISALLOWED_SEARCH_CHARS = /[\$\{\}\[\];'`|\\<>\n\r]/;
const DISALLOWED_SEARCH_CHARS_GLOBAL = /[\$\{\}\[\];'`|\\<>\n\r]/g;

const MAX_QUERY_LENGTH = 200;

/**
 * Sanitize search query to prevent NoSQL injection, XSS, and command injection attacks.
 * Uses a single-pass regex replacement to prevent order-of-operation bypasses.
 *
 * @param {string} query - The raw search query from user input
 * @returns {string} - Sanitized query safe for API transmission
 */
export const sanitizeSearchQuery = (query = '') => {
  if (typeof query !== 'string') {
    return '';
  }

  let sanitized = query.trim();

  // Single-pass replacement prevents sequential-pass assembly attacks (e.g., `<\<`)
  sanitized = sanitized.replace(DISALLOWED_SEARCH_CHARS_GLOBAL, '');

  if (sanitized.length > MAX_QUERY_LENGTH) {
    sanitized = sanitized.substring(0, MAX_QUERY_LENGTH);
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

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { isValid: false, error: `Search query must be less than ${MAX_QUERY_LENGTH} characters` };
  }

  // Exactly matches characters disallowed in sanitizeSearchQuery
  if (DISALLOWED_SEARCH_CHARS.test(trimmed)) {
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
 * Entity-escapes special characters (including backticks and equals) to prevent XSS.
 *
 * @param {string} text - Raw input text from the UI
 * @returns {string} - Clean, safe plain-text
 */
export const sanitizeInputText = (text = '') => {
  if (typeof text !== 'string') {
    return '';
  }

  // Expanded entity map including backticks and equals sign to prevent attribute-injection XSS
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return text.replace(/[&<>"'/`=]/g, (match) => htmlEscapes[match]);
};