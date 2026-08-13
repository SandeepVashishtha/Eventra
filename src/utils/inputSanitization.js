
/**
 * Input Sanitization Utilities
 *
 * Sanitize and validate user input to prevent injection attacks
 * and ensure data integrity across API boundaries.
 */

// Single-pass regex targeting all disallowed characters.
// Blocks NoSQL operators ($), object/array notation ({}, []), quotes/backticks ('"`),
// pipes/statements (|;\), HTML tags (<>), slashes (/), and newline/carriage controls.
const DISALLOWED_SEARCH_CHARS = /[\$\{\}\[\];'"`|\\\/<>\n\r]/;
const DISALLOWED_SEARCH_CHARS_GLOBAL = /[\$\{\}\[\];'"`|\\\/<>\n\r]/g;

// Executable HTML structures that are dropped wholesale — a plain character strip
// cannot remove them without leaving their inner payloads searchable.
const SCRIPT_BLOCK_PATTERN = /<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const SCRIPT_TAG_PATTERN = /<\s*\/?\s*(script|style)\b[^>]*>?/gi;
const EMBED_TAG_PATTERN = /<\s*(img|iframe|object|embed|svg|math|link|meta)\b[^>]*>?/gi;
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s<>]+)/gi;
const PROTOCOL_SCHEME_PATTERN = /\b(?:java|vb)script\s*:/gi;
const JS_SINK_PATTERN = /\b(?:alert|confirm|prompt)\s*\([^)]*\)/gi;

// Characters with special meaning in regular expressions. The sanitized query is
// handed to backend search endpoints that may match with regex, so they must be
// escaped to prevent Regex Injection / ReDoS (Issue #14658).
const REGEXP_META_PATTERN = /[.*+?^${}()|[\]\\]/g;

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

  sanitized = sanitized
    // Drop executable blocks before stripping tag characters so their payloads
    // cannot survive as searchable text.
    .replace(SCRIPT_BLOCK_PATTERN, ' ')
    .replace(SCRIPT_TAG_PATTERN, ' ')
    .replace(EMBED_TAG_PATTERN, ' ')
    .replace(EVENT_HANDLER_PATTERN, ' ')
    .replace(PROTOCOL_SCHEME_PATTERN, ' ')
    .replace(JS_SINK_PATTERN, ' ')
    // Single-pass replacement prevents sequential-pass assembly attacks (e.g., `<\<`)
    .replace(DISALLOWED_SEARCH_CHARS_GLOBAL, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (sanitized.length > MAX_QUERY_LENGTH) {
    sanitized = sanitized.substring(0, MAX_QUERY_LENGTH).trim();
  }

  return sanitized;
};

/**
 * Escape regular-expression metacharacters so a sanitized query can be safely
 * embedded in backend regex searches without Regex Injection or ReDoS.
 *
 * @param {string} value - String that will be used inside a regex
 * @returns {string} - Regex-literal-safe copy
 */
export const escapeRegExp = (value = '') => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(REGEXP_META_PATTERN, '\\$&');
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
 * Combines sanitization and validation, then escapes regex metacharacters
 * so the result is safe for backend regex-based search.
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
  return escapeRegExp(sanitized);
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
