const DEFAULT_ALLOWED_ORIGINS = [
  "https://eventra.sandeepvashishtha.tech",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

const getAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  }
  if (process.env.ALLOWED_ORIGIN) {
    return [process.env.ALLOWED_ORIGIN];
  }
  return DEFAULT_ALLOWED_ORIGINS;
};

export const buildCorsHeaders = (req) => {
  const origin = req?.headers?.get
    ? req.headers.get("origin")
    : req?.headers?.origin;

  const allowedOrigins = getAllowedOrigins();
  const matchedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const headers = {
    "Access-Control-Allow-Origin": matchedOrigin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Vary": "Origin",
  };

  if (matchedOrigin) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
};

export const corsResponse = (req, res, status, body) => {
  const headers = buildCorsHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(status).json(body);
};
