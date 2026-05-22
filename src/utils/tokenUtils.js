/**
 * Lightweight JWT token utilities.
 *
 * Decodes the payload of a standard JWT (header.payload.signature) using
 * native base64 parsing — no external libraries required.
 *
 * These helpers are used by AuthContext to validate stored tokens on app
 * start and to detect expired sessions before they cause silent API failures.
 */

/**
 * Safely decodes the payload section of a JWT token.
 *
 * @param {string} token - A JWT string (three dot-separated segments).
 * @returns {object|null} The decoded payload object, or null if the token
 *                        is malformed or cannot be parsed.
 */
export const decodeTokenPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // JWT payloads use base64url encoding — convert to standard base64
    // by replacing URL-safe characters and adding padding.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    // Token is malformed or corrupted — treat as invalid.
    return null;
  }
};

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
export const isTokenExpired = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    // Tokens without an `exp` claim are treated as expired to be safe.
    return true;
  }

  const GRACE_SECONDS = 30;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp - GRACE_SECONDS <= nowInSeconds;
};

/**
 * Validates that a JWT token is structurally sound and not expired.
 *
 * @param {string} token - A JWT string.
 * @returns {boolean} True if the token has a valid structure, a decodable
 *                    payload, and has not yet expired.
 */
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  return !isTokenExpired(token);
};
