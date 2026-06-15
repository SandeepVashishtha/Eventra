/**
 * Parses the ALLOWED_ORIGINS environment variable into an array of trusted origins.
 * Handles comma-separated values, trims whitespace, and filters empty entries.
 * 
 * @returns {string[]} Array of allowed origin URLs
 */
export const getAllowedOrigins = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS || "";
  
  if (!envOrigins || typeof envOrigins !== "string") {
    return [];
  }

  return envOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

/**
 * Checks if a given origin is allowed based on the allowlist and development mode.
 * In non-production environments, common localhost origins are automatically allowed.
 * 
 * @param {string} origin - The origin URL to validate
 * @returns {boolean} True if the origin is allowed, false otherwise
 */
export const isAllowedOrigin = (origin) => {
  if (!origin || typeof origin !== "string") {
    return false;
  }

  const allowedOrigins = getAllowedOrigins();

  // Check against explicit allowlist
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow common development origins in non-production environments
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (isDevelopment) {
    const developmentOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ];
    return developmentOrigins.includes(origin);
  }

  // Fail closed: reject untrusted origins in production
  return false;
};

/**
 * Builds CORS headers for a given request.
 * Validates the Origin header against the allowlist and returns appropriate headers.
 * 
 * Security decisions:
 * - No wildcard origin (*) is ever returned
 * - Origin is only reflected after validation against allowlist
 * - Exact string matching is used (no regex)
 * - Vary: Origin is always returned to prevent caching issues
 * - Untrusted origins receive no ACAO header (fail closed)
 * 
 * @param {Object} req - The HTTP request object
 * @returns {Object} CORS headers object
 */
export const buildCorsHeaders = (req) => {
  const requestOrigin = req.headers?.origin;
  const isOriginAllowed = isAllowedOrigin(requestOrigin);

  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };

  // Only set ACAO for validated, trusted origins
  if (isOriginAllowed && requestOrigin) {
    headers["Access-Control-Allow-Origin"] = requestOrigin;
  }

  return headers;
};

export const corsResponse = (req, res, status, body) => {
  const headers = buildCorsHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(status).json(body);
};
