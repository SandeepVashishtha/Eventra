/**
 * Dynamic Token Generator for Anti-Screenshot Barcode Overlay
 * 
 * Generates short-lived TOTP tokens that rotate every 15 seconds to prevent
 * unauthorized check-ins from static screenshots.
 * 
 * Uses Web Crypto API for browser-compatible cryptographic hashing.
 * Falls back to simple hash function if Web Crypto is not available.
 * 
 * @module utils/security/barcode/dynamicTokenGenerator
 */

/**
 * Simple SHA-256 hash function using Web Crypto API
 * Falls back to a basic hash function if Web Crypto is not available
 * 
 * @param {string} input - String to hash
 * @returns {Promise<string>} - Hex encoded hash
 */
async function sha256(input) {
  // Try using Web Crypto API (browser)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback: Simple hash function (not cryptographically secure)
  // This is a basic implementation for environments without Web Crypto
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Default token rotation interval in seconds
 */
export const DEFAULT_ROTATION_INTERVAL = 15;

/**
 * Default token length in characters
 */
export const DEFAULT_TOKEN_LENGTH = 8;

/**
 * Generates a time-based one-time password (TOTP) token
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.userId - User identifier (email, username, or ID)
 * @param {string} options.ticketId - Ticket identifier
 * @param {string} [options.secret] - Optional secret key for additional security
 * @param {number} [options.interval=15] - Token rotation interval in seconds
 * @param {number} [options.length=8] - Length of the token
 * @returns {Promise<string>} - Generated TOTP token
 */
export async function generateTotpToken({ userId, ticketId, secret = '', interval = DEFAULT_ROTATION_INTERVAL, length = DEFAULT_TOKEN_LENGTH }) {
  // Get current time window (number of intervals since epoch)
  const timeWindow = Math.floor(Date.now() / (interval * 1000));
  
  // Create a hash input combining user data, ticket data, time window, and secret
  const hashInput = `${userId}:${ticketId}:${timeWindow}:${secret}`;
  
  // Generate SHA-256 hash of the input
  const hash = await sha256(hashInput);
  
  // Convert hash to numeric value and generate token
  return generateTokenFromHash(hash, length);
}

/**
 * Generates a token from a hash string
 * 
 * @param {string} hash - Hex encoded hash string
 * @param {number} length - Desired token length
 * @returns {string} - Numeric token string
 */
function generateTokenFromHash(hash, length) {
  // Convert hex string to byte array
  const bytes = [];
  for (let i = 0; i < Math.min(64, hash.length); i += 2) {
    const byteStr = hash.substr(i, 2);
    const byte = parseInt(byteStr, 16);
    if (!isNaN(byte)) {
      bytes.push(byte);
    }
  }
  
  // Combine first 8 bytes of hash into a bigint
  let numericValue = 0n;
  for (let i = 0; i < Math.min(8, bytes.length); i++) {
    numericValue = (numericValue << 8n) | BigInt(bytes[i]);
  }
  
  // Generate token by taking modulo 10^length
  const modulo = 10n ** BigInt(length);
  let tokenValue = numericValue % modulo;
  
  // Ensure token has exactly 'length' digits, padding with leading zeros if needed
  const token = tokenValue.toString().padStart(length, '0');
  
  // Return only the last 'length' digits
  return token.slice(-length);
}

/**
 * Generates a dynamic barcode payload with rotating token
 * 
 * @param {Object} params - Payload parameters
 * @param {string} params.userId - User identifier
 * @param {string} params.ticketId - Ticket identifier
 * @param {string} [params.eventId] - Optional event identifier
 * @param {string} [params.secret] - Optional secret key
 * @param {number} [params.interval=15] - Token rotation interval in seconds
 * @param {number} [params.length=8] - Token length
 * @returns {Promise<Object>} - Barcode payload with token, timestamp, and metadata
 */
export async function generateDynamicBarcodePayload({ userId, ticketId, eventId, secret = '', interval = DEFAULT_ROTATION_INTERVAL, length = DEFAULT_TOKEN_LENGTH }) {
  const token = await generateTotpToken({ userId, ticketId, secret, interval, length });
  const timeWindow = Math.floor(Date.now() / (interval * 1000));
  const expiresAt = (timeWindow + 1) * interval * 1000;
  
  return {
    ticketId,
    userId,
    eventId,
    token,
    timeWindow,
    expiresAt,
    generatedAt: Date.now(),
    interval,
    version: '1.0'
  };
}

/**
 * Validates a dynamic barcode token
 * 
 * @param {Object} payload - Barcode payload to validate
 * @param {string} payload.token - The token to validate
 * @param {number} payload.timeWindow - The time window when token was generated
 * @param {number} payload.interval - The rotation interval
 * @param {string} payload.userId - User identifier
 * @param {string} payload.ticketId - Ticket identifier
 * @param {string} [payload.secret] - Optional secret key
 * @param {number} [maxWindowDiff=1] - Maximum allowed time window difference
 * @returns {Promise<Object>} - Validation result with isValid and details
 */
export async function validateDynamicToken({ token, timeWindow, interval = DEFAULT_ROTATION_INTERVAL, userId, ticketId, secret = '' }, maxWindowDiff = 1) {
  // Calculate current time window
  const currentWindow = Math.floor(Date.now() / (interval * 1000));
  const windowDiff = Math.abs(currentWindow - timeWindow);
  
  // Check if token is within valid time window
  const isWithinWindow = windowDiff <= maxWindowDiff;
  
  // Re-generate token to verify it matches
  const expectedToken = await generateTotpToken({ userId, ticketId, secret, interval });
  const isTokenValid = token === expectedToken;
  
  // Also check previous and next windows for edge cases
  let isValid = isWithinWindow && isTokenValid;
  
  // If not valid, check adjacent windows
  if (!isValid && maxWindowDiff > 0) {
    for (let offset = -maxWindowDiff; offset <= maxWindowDiff; offset++) {
      if (offset === 0) continue;
      
      const testWindow = timeWindow + offset;
      const testPayload = {
        userId,
        ticketId,
        secret,
        interval
      };
      
      // Temporarily override time for testing
      const originalDateNow = Date.now;
      try {
        // Mock Date.now to return a time in the test window
        const testTime = testWindow * interval * 1000 + (interval * 1000) / 2;
        Date.now = () => testTime;
        
        const testToken = await generateTotpToken(testPayload);
        if (testToken === token) {
          isValid = true;
          break;
        }
      } finally {
        Date.now = originalDateNow;
      }
    }
  }
  
  return {
    isValid,
    currentWindow,
    expectedWindow: timeWindow,
    windowDiff,
    expectedToken,
    details: isValid ? 'Token is valid' : `Token expired or invalid (window diff: ${windowDiff})`
  };
}

/**
 * Gets the current time window for token generation
 * 
 * @param {number} [interval=15] - Token rotation interval in seconds
 * @returns {number} - Current time window
 */
export function getCurrentTimeWindow(interval = DEFAULT_ROTATION_INTERVAL) {
  return Math.floor(Date.now() / (interval * 1000));
}

/**
 * Calculates time remaining until next token rotation
 * 
 * @param {number} [interval=15] - Token rotation interval in seconds
 * @returns {number} - Seconds remaining until next rotation
 */
export function getSecondsUntilRotation(interval = DEFAULT_ROTATION_INTERVAL) {
  const currentWindow = getCurrentTimeWindow(interval);
  const windowStart = currentWindow * interval * 1000;
  const windowEnd = windowStart + interval * 1000;
  const now = Date.now();
  
  return Math.ceil((windowEnd - now) / 1000);
}

/**
 * Creates a QR code value from dynamic barcode payload
 * 
 * @param {Object} payload - Dynamic barcode payload
 * @returns {string} - JSON string for QR code encoding
 */
export function createQrValue(payload) {
  const { token, timeWindow, ticketId, userId, expiresAt } = payload;
  
  return JSON.stringify({
    token,
    timeWindow,
    ticketId,
    userId,
    expiresAt
  });
}

/**
 * Parses QR code value back to payload object
 * 
 * @param {string} qrValue - QR code value (JSON string)
 * @returns {Object|null} - Parsed payload or null if invalid
 */
export function parseQrValue(qrValue) {
  try {
    const payload = JSON.parse(qrValue);
    
    // Validate required fields
    if (!payload || typeof payload !== 'object') return null;
    if (!payload.token || !payload.timeWindow || !payload.ticketId) return null;
    
    return payload;
  } catch {
    return null;
  }
}

export default {
  generateTotpToken,
  generateDynamicBarcodePayload,
  validateDynamicToken,
  getCurrentTimeWindow,
  getSecondsUntilRotation,
  createQrValue,
  parseQrValue,
  DEFAULT_ROTATION_INTERVAL,
  DEFAULT_TOKEN_LENGTH
};
