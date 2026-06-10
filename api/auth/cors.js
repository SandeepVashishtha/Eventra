export const buildCorsHeaders = (req) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

export const corsResponse = (req, res, status, body) => {
  const headers = buildCorsHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(status).json(body);
};
