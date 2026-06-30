/**
 * CSRF Protection Middleware (Double-Submit Cookie Pattern)
 *
 * Sets a CSRF token cookie (XSRF-TOKEN) on safe requests and validates
 * that the X-CSRF-Token header matches the cookie value for mutating
 * requests (POST, PUT, PATCH, DELETE).
 *
 * This pattern works because an attacker on a different origin cannot
 * read or set cookies for the target domain — the Same-Origin Policy
 * prevents reading the cookie value, and the SameSite cookie attribute
 * prevents sending cookies cross-site.
 */

import crypto from 'crypto';

export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';
export const CSRF_COOKIE_MAX_AGE = 86400; // 24 hours

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Generates a cryptographically secure random CSRF token.
 * @param {number} [bytes=32] - Number of random bytes
 * @returns {string} Hex-encoded token
 */
export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Extracts the CSRF cookie from a request.
 * @param {Request} request - Incoming request
 * @returns {string|null} Cookie value or null
 */
export function getCsrfCookie(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${CSRF_COOKIE_NAME}=`)) {
      return decodeURIComponent(cookie.substring(CSRF_COOKIE_NAME.length + 1));
    }
  }
  return null;
}

/**
 * Extracts the CSRF token from the request header.
 * @param {Request} request - Incoming request
 * @returns {string|null} Token value or null
 */
export function getCsrfHeader(request) {
  return request.headers.get(CSRF_HEADER_NAME);
}

/**
 * Checks if the request method requires CSRF protection.
 * @param {string} method - HTTP method
 * @returns {boolean}
 */
export function requiresCsrfProtection(method) {
  return MUTATING_METHODS.has(method?.toUpperCase());
}

/**
 * Returns a Response with the CSRF cookie set.
 * Used to set the token on safe requests.
 * @param {Response} response - The response to attach the cookie to
 * @param {string} token - CSRF token value
 * @returns {Response} Response with Set-Cookie header
 */
export function attachCsrfCookie(response, token) {
  const cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${CSRF_COOKIE_MAX_AGE}; SameSite=Lax; Secure`;

  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', cookie);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Validates the CSRF token for a request.
 * For safe methods, sets a new CSRF cookie if none exists.
 * For mutating methods, validates that the header matches the cookie.
 *
 * @param {Request} request - Incoming request
 * @returns {{ valid: boolean, response?: Response, token?: string }}
 */
export function validateCsrf(request) {
  const method = request.method.toUpperCase();
  const cookieToken = getCsrfCookie(request);

  if (!requiresCsrfProtection(method)) {
    // Safe method - set CSRF cookie if missing
    if (!cookieToken) {
      return {
        valid: true,
        token: generateToken(),
      };
    }
    return { valid: true };
  }

  // Mutating method - validate token
  if (!cookieToken) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: 'CSRF token cookie is missing' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }

  const headerToken = getCsrfHeader(request);
  if (!headerToken) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: 'CSRF token header is missing' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }

  // Constant-time comparison to prevent timing attacks
  const bufCookie = Buffer.from(cookieToken, 'utf8');
  const bufHeader = Buffer.from(headerToken, 'utf8');

  if (bufCookie.length !== bufHeader.length || !crypto.timingSafeEqual(bufCookie, bufHeader)) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: 'CSRF token mismatch' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }

  return { valid: true };
}