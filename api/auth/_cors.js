/**
 * api/auth/_cors.js
 *
 * CORS helper functions for API endpoints.
 * Uses project's existing allowlist logic from middleware/csp.js.
 */

/**
 * Validates a URL string and extracts its origin.
 * Reuses logic from middleware/csp.js for consistency.
 *
 * @param {string} urlStr - URL string to validate
 * @returns {string|null} Valid origin or null
 */
function validateOrigin(urlStr) {
  if (!urlStr || typeof urlStr !== "string") {
    return null;
  }

  const trimmed = urlStr.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Gets the list of allowed origins from environment variables.
 * Reuses logic from middleware/csp.js for consistency.
 *
 * @returns {string[]} Array of allowed origins
 */
function getAllowedOrigins() {
  const origins = new Set();

  const envVars = [
    process.env.BACKEND_URL,
    process.env.VITE_API_URL,
    process.env.REACT_APP_API_URL,
  ];

  for (const envVar of envVars) {
    if (envVar) {
      const origin = validateOrigin(envVar);
      if (origin) {
        origins.add(origin);
      }
    }
  }

  return Array.from(origins);
}

/**
 * Checks if a request origin is in the allowlist.
 *
 * @param {string} requestOrigin - Origin from request headers
 * @returns {boolean} True if origin is allowed
 */
function isOriginAllowed(requestOrigin) {
  if (!requestOrigin) {
    return false;
  }

  const allowedOrigins = getAllowedOrigins();

  // If no origins configured, deny by default (fail-closed)
  if (allowedOrigins.length === 0) {
    return false;
  }

  return allowedOrigins.includes(requestOrigin);
}

/**
 * Builds CORS headers for API responses.
 * Only allows origins from the configured allowlist.
 * Does NOT use wildcard when credentials are enabled.
 *
 * @param {Object} req - The request object
 * @returns {Object} CORS headers object
 */
export function buildCorsHeaders(req) {
  const requestOrigin = req.headers?.origin;

  // Only return the origin if it's in the allowlist
  const allowedOrigin = isOriginAllowed(requestOrigin) ? requestOrigin : null;

  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };

  // Only set Access-Control-Allow-Origin if origin is allowed
  // Never use wildcard with credentials
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

/**
 * Sends a CORS-enabled JSON response.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {number} status - HTTP status code
 * @param {Object} payload - Response payload
 * @returns {Object} Express/Next.js response object
 */
export function corsResponse(req, res, status, payload) {
  return res
    .status(status)
    .set(buildCorsHeaders(req))
    .json(payload);
}
