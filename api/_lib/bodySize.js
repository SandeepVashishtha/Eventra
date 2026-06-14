const DEFAULT_MAX_BODY_BYTES = 10 * 1024;

const ENDPOINT_LIMITS = {
  "/api/auth/signup": 4 * 1024,
  "/api/auth/login": 2 * 1024,
  "/api/events/register": 2 * 1024,
  "/api/events/[eventId]/register": 2 * 1024,
};

function isJsonContentType(req) {
  const contentType = req.headers?.["content-type"] || "";
  return contentType.includes("application/json") || contentType.includes("application/x-www-form-urlencoded");
}

function getExpectedSize(req) {
  const raw = req.headers?.["content-length"];
  if (raw === undefined || raw === null) return null;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function getEndpointLimit(req) {
  const path = req.url?.split("?")[0] || "";
  return ENDPOINT_LIMITS[path] || DEFAULT_MAX_BODY_BYTES;
}

export function getBodySizeError(req) {
  const contentType = req.headers?.["content-type"];
  if (contentType && !isJsonContentType(req)) {
    return null;
  }

  const contentLength = getExpectedSize(req);
  if (contentLength === null) {
    return null;
  }

  const limit = getEndpointLimit(req);
  if (contentLength > limit) {
    return {
      status: 413,
      error: `Request body too large. Maximum size is ${limit} bytes for this endpoint.`,
      limit,
      received: contentLength,
    };
  }

  return null;
}

export function enforceBodySize(req, res) {
  const error = getBodySizeError(req);
  if (error) {
    res.status(error.status).json({ error: error.error });
    return true;
  }
  return false;
}
