/**
 * CORS Utilities for Eventra API
 *
 * Provides consistent CORS handling across all API endpoints.
 * Uses explicit allowlist from environment configuration.
 */

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://eventra.sandeepvashishtha.in',
];

/**
 * Parses comma-separated allowed origins from environment variable.
 * Falls back to defaults if not set.
 * @returns {string[]} Array of allowed origin strings
 */
export function getAllowedOrigins() {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (!envOrigins) {
    return DEFAULT_ALLOWED_ORIGINS;
  }
  return envOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

/**
 * Checks if an origin is in the allowed list.
 * Supports exact match and wildcard subdomain matching.
 * @param {string} origin - The Origin header value
 * @returns {boolean} True if origin is allowed
 */
export function isAllowedOrigin(origin) {
  if (!origin) return false;
  const allowed = getAllowedOrigins();

  // Exact match
  if (allowed.includes(origin)) return true;

  // Wildcard subdomain matching (e.g., *.eventra.com)
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.hostname;
    return allowed.some((allowedOrigin) => {
      if (allowedOrigin.startsWith('*.')) {
        const allowedDomain = allowedOrigin.slice(2);
        return originHost === allowedDomain || originHost.endsWith('.' + allowedDomain);
      }
      return false;
    });
  } catch {
    return false;
  }
}

/**
 * Builds CORS headers for a given request origin.
 * Returns empty headers if origin is not allowed.
 * @param {string} origin - The Origin header value
 * @param {object} [options] - Additional options
 * @param {boolean} [options.allowCredentials] - Include credentials header
 * @returns {Headers} CORS headers
 */
export function buildCorsHeaders(origin, options = {}) {
  const headers = new Headers();
  const allowed = isAllowedOrigin(origin);

  if (!allowed) {
    return headers;
  }

  headers.set('Access-Control-Allow-Origin', origin);
  if (options.allowCredentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  headers.set('Vary', 'Origin');

  return headers;
}

/**
 * Creates a standard CORS preflight response.
 * @param {string} origin - The Origin header value
 * @param {object} [options] - Additional options
 * @returns {Response} CORS preflight response
 */
export function corsResponse(origin, options = {}) {
  const headers = buildCorsHeaders(origin, { allowCredentials: true, ...options });

  // Always allow these methods and headers
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Middleware helper to handle CORS for API routes.
 * Handles OPTIONS preflight and adds CORS headers to all responses.
 * @param {Request} request - Incoming request
 * @param {Function} handler - Route handler function
 * @returns {Promise<Response>} Response with CORS headers
 */
export async function withCors(request, handler) {
  const origin = request.headers.get('origin');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return corsResponse(origin);
  }

  const response = await handler(request);

  // Add CORS headers to actual response
  const corsHeaders = buildCorsHeaders(origin, { allowCredentials: true });
  const newHeaders = new Headers(response.headers);
  corsHeaders.forEach((value, key) => newHeaders.set(key, value));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}