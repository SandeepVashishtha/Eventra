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
    // Credentialed CORS cannot safely use '*', so ignore it if configured.
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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
};

export const corsResponse = (req, res, status, data) => {
  return res.status(status).set(buildCorsHeaders(req)).json(data);
};
