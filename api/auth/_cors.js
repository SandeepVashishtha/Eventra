/**
 * Secure CORS implementation for authentication endpoints.
 *
 * Replaces wildcard CORS with origin allowlist validation to prevent
 * cross-origin attacks while maintaining compatibility with configured
 * frontend deployments.
 */

/**
 * Extracts and normalizes allowed origins from environment variables.
 *
 * Supports: BACKEND_URL, VITE_API_URL, REACT_APP_API_URL, REACT_APP_PUBLIC_URL
 * Also supports: ALLOWED_ORIGINS (comma-separated list)
 *
 * @returns {Set<string>} Set of normalized allowed origins
 */
function addOriginIfValid(origins, origin) {
  try {
    const normalized = normalizeOrigin(origin);
    if (normalized) origins.add(normalized);
  } catch (e) {
  }
}

function addExplicitOrigins(origins) {
  if (!process.env.ALLOWED_ORIGINS) return;
  const explicitOrigins = process.env.ALLOWED_ORIGINS
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  explicitOrigins.forEach(origin => addOriginIfValid(origins, origin));
}

function addEnvVarOrigins(origins) {
  const envVars = ['BACKEND_URL', 'VITE_API_URL', 'REACT_APP_API_URL', 'REACT_APP_PUBLIC_URL'];
  envVars.forEach(varName => {
    const url = process.env[varName];
    if (url) addOriginIfValid(origins, url);
  });
}

function addDevOrigins(origins) {
  if (process.env.NODE_ENV === 'production') return;
  const devPorts = [3000, 5173, 8080];
  devPorts.forEach(port => {
    const devOrigin = `http://localhost:${port}`;
    if (!origins.has(devOrigin)) origins.add(devOrigin);
  });
}

function getAllowedOrigins() {
  const origins = new Set();
  addExplicitOrigins(origins);
  addEnvVarOrigins(origins);
  addDevOrigins(origins);
  return origins;
}

/**
 * Normalizes an origin URL for consistent comparison.
 *
 * - Removes trailing slashes
 * - Ensures consistent protocol format
 * - Validates URL format
 * - Rejects dangerous protocols (javascript:, data:, etc.)
 *
 * @param {string} origin - Origin URL to normalize
 * @returns {string|null} Normalized origin or null if invalid
 */
function normalizeOrigin(origin) {
  if (!origin || typeof origin !== 'string') {
    return null;
  }

  const trimmed = origin.trim();

  // Handle origins that might be just protocol + host (no path)
  let url;
  try {
    url = new URL(trimmed);
  } catch (e) {
    return null;
  }

  // Reject dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
  if (dangerousProtocols.some(protocol => url.protocol === protocol)) {
    return null;
  }

  // Only allow http and https protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }

  // Normalize: protocol://host:port (remove path, search, hash)
  const normalized = `${url.protocol}//${url.host}`;
  return normalized;
}

/**
 * Validates if a request origin is in the allowlist.
 *
 * @param {string|null} origin - Request origin header
 * @returns {boolean} True if origin is allowed
 */
function isOriginAllowed(origin) {
  if (!origin) {
    // Missing origin header - deny by default
    return false;
  }

  const allowedOrigins = getAllowedOrigins();
  const normalized = normalizeOrigin(origin);
  
  if (!normalized) {
    return false;
  }

  return allowedOrigins.has(normalized);
}

/**
 * Builds secure CORS headers based on request origin validation.
 *
 * - Only reflects origin if it's in the allowlist
 * - Adds Vary: Origin to prevent cache poisoning
 * - Never returns wildcard origins
 *
 * @param {Object} req - Request object with headers
 * @returns {Object} CORS headers object
 */
export const buildCorsHeaders = (req) => {
  const requestOrigin = req.headers?.origin;
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };

  if (isOriginAllowed(requestOrigin)) {
    headers["Access-Control-Allow-Origin"] = requestOrigin;
    // Add credentials support for same-origin requests
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  // If origin is not allowed, do NOT reflect it - return restrictive headers

  return headers;
};

/**
 * Applies CORS headers and sends a JSON response.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} status - HTTP status code
 * @param {Object} body - Response body
 */
export const corsResponse = (req, res, status, body) => {
  const headers = buildCorsHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(status).json(body);
};

/**
 * Handles OPTIONS preflight requests with secure origin validation.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const handlePreflight = (req, res) => {
  const headers = buildCorsHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(204).end();
};

// Export functions for testing
export { getAllowedOrigins, normalizeOrigin, isOriginAllowed };
