/**
 * src/utils/auth.js
 *
 * Client-side JWT utility helpers.
 *
 * IMPORTANT: These functions decode the token payload WITHOUT verifying its
 * cryptographic signature — that step happens server-side. The sole purpose
 * here is to give the UI early feedback about expiry so we can redirect the
 * user before they hit a 401 Unauthorized error from the API.
 *
 * SECURITY MODEL:
 * ───────────────
 * The JWT is the authoritative source for authentication and authorization:
 * 1. JWT is signed by the backend — cannot be forged by client
 * 2. JWT is delivered over HTTPS — cannot be intercepted and modified
 * 3. Even if localStorage is tampered with, authorization checks use the JWT
 *
 * localStorage is used ONLY for UI state (display name, email, cached theme, etc.),
 * never for security-critical decisions.
 *
 * Authorization flows should always verify against the JWT token, not localStorage.
 * Server must also validate authorization for every API request.
 */

/** Grace period (in seconds) to account for clock skew between browser and server. */
const CLOCK_SKEW_BUFFER = 30;

/**
 * Decode a JWT payload without verification (client-side only).
 * Handles both standard base64 and URL-safe base64url encoding.
 *
 * @param {string} token - A JWT string (three dot-separated segments).
 * @returns {object|null} The decoded payload, or null if malformed.
 */
export function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Convert base64url → standard base64, then add padding.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    // Use decodeURIComponent + escape to safely handle non-ASCII characters.
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    // Malformed or corrupted token — treat as invalid.
    return null;
  }
}

/**
 * Checks whether a JWT token has expired.
 *
 * A small grace buffer (30 seconds) avoids race conditions where a token
 * expires between the check and the actual API request.
 *
 * @param {string} token - A JWT string.
 * @returns {boolean} True if the token is expired, malformed, or missing
 *                    an `exp` claim. Returns false only when the token has
 *                    a valid, future expiry timestamp.
 */
export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    // Tokens without an `exp` claim are treated as expired to be safe.
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp - CLOCK_SKEW_BUFFER <= nowInSeconds;
}

/**
 * Returns true if the token exists AND is not expired.
 * Adds a 30-second grace buffer to account for clock skew between
 * the browser and the backend server.
 *
 * @param {string} token - A JWT string.
 * @returns {boolean} True only when the token is structurally valid and
 *                    its `exp` claim is in the future (minus grace period).
 */
export function isTokenValid(token) {
  if (!token || typeof token !== 'string') return false;
  return !isTokenExpired(token);
}

/**
 * Returns seconds until the token expires.
 * Returns a negative number if the token is already expired.
 *
 * @param {string} token - A JWT string.
 * @returns {number} Seconds until expiry, or -1 if `exp` is missing/invalid.
 */
export function getTokenTTL(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return -1;
  return payload.exp - Math.floor(Date.now() / 1000);
}