import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV !== "production" ? "eventra-dev-jwt-secret" : null);

export const getAuthenticatedUserId = (req) => {
  const verifiedUser =
    req.user?.id ||
    req.user?.userId ||
    req.auth?.userId ||
    req.session?.user?.id ||
    null;

  if (verifiedUser) return String(verifiedUser);

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      if (JWT_SECRET) {
        const payload = jwt.verify(token, JWT_SECRET);
        return String(payload.sub || payload.userId || payload.id || "");
      }
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
        );
        return String(payload.sub || payload.userId || payload.id || "");
      }
    } catch {
      return "";
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return String(req.headers["x-user-id"] || req.headers["x-eventra-user-id"] || "");
  }

  return "";
};

export const getCurrentSessionId = (req) => {
  const header =
    req.headers?.["x-session-id"] ||
    req.headers?.["X-Session-Id"] ||
    "";
  return String(header || "").trim();
};

export const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export const parseBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
};
