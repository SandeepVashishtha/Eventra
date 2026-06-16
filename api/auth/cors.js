/**
 * api/auth/cors.js
 *
 * CORS configuration and validation utility for Eventra.
 * Restricts cross-origin resource sharing (CORS) to explicitly allowed origins.
 */

/**
 * Retrieve the list of allowed CORS origins from the environment configuration.
 * Parses a comma-separated list of URLs and filters out malformed or empty entries.
 *
 * @returns {string[]} List of allowed origin strings.
 */
export const getAllowedOrigins = () => {
  const allowedVar = process.env.ALLOWED_ORIGINS || "";
  if (!allowedVar || !allowedVar.trim()) {
    return [];
  }
  return allowedVar
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

/**
 * Check if the given origin is trusted for CORS access.
 * Allows configured ALLOWED_ORIGINS, same-origin calls, and localhost in development.
 *
 * @param {string|null|undefined} origin - The request's Origin header value
 * @returns {boolean} True if the origin is authorized, false otherwise.
 */
export const isAllowedOrigin = (origin) => {
  if (!origin || typeof origin !== "string") {
    return false;
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Development fallback for local testing
  if (process.env.NODE_ENV === "development") {
    const devOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ];
    if (devOrigins.includes(origin)) {
      return true;
    }
  }

  return false;
};

/**
 * Build standard CORS headers for a response based on the request's origin.
 *
 * @param {object} req - Incoming request object containing headers
 * @returns {object} CORS headers map to apply to the response
 */
export const buildCorsHeaders = (req) => {
  const headers = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  const origin = req?.headers?.origin || req?.headers?.Origin;
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
};

/**
 * Send a JSON response decorated with appropriate CORS headers.
 *
 * @param {object} req - HTTP request object
 * @param {object} res - HTTP response object
 * @param {number} status - HTTP status code
 * @param {object} data - JSON payload data
 */
export const corsResponse = (req, res, status, data) => {
  const corsHeaders = buildCorsHeaders(req);
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value);
  }
  return res.status(status).json(data);
};
