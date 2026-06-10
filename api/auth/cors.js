// ---------------------------------------------------------------------------
// CORS — accepts ALLOWED_ORIGINS / ALLOWED_ORIGIN (comma-separated env vars),
// falls back to production domains + common local dev ports, and dynamically
// echoes the request origin when it is in the allowed set.
// ---------------------------------------------------------------------------

const DEFAULT_ALLOWED_ORIGINS = [
  "https://eventra.sandeepvashishtha.tech",
  "https://eventra.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const parseAllowedOrigins = () => {
  const configured = process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || "";
  const origins = configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .filter((origin) => origin !== "*");

  return origins.length > 0 ? origins : DEFAULT_ALLOWED_ORIGINS;
};

const isLocalDevelopmentOrigin = (origin) =>
  process.env.NODE_ENV !== "production" &&
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const isOriginAllowed = (origin, allowedOrigins) =>
  Boolean(origin) &&
  (allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin));

export const buildCorsHeaders = (req = {}) => {
  const requestOrigin = req.headers?.origin || "";
  const allowedOrigins = parseAllowedOrigins();
  const allowedOrigin = isOriginAllowed(requestOrigin, allowedOrigins) ? requestOrigin : null;

  const headers = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    "Vary": "Origin",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
};

export const corsResponse = (req, res, status, data) => {
  const headers = buildCorsHeaders(req);
  if (typeof res.writeHead === "function") {
    res.writeHead(status, { "Content-Type": "application/json", ...headers });
    res.end(JSON.stringify(data));
    return;
  }
  if (typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }
  if (typeof res.status === "function") {
    res.status(status).json(data);
  } else {
    res.statusCode = status;
    res.end(JSON.stringify(data));
  }
};
