import jwt from "jsonwebtoken";
import { getJwtSecret } from "../auth/jwt-config.js";

const parseTokenFromCookie = (req) => {
  const cookieHeader = req.headers?.cookie || "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
  return tokenMatch ? tokenMatch[1] : null;
};

const sendUnauthorized = (res, message) => {
  if (typeof res.writeHead === "function") {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
    return;
  }
  if (typeof res.status === "function") {
    res.status(401).json({ error: message });
  } else {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  }
};

export const getAuthenticatedUserId = (req) => {
  return req.user?.id ?? null;
};

export const withAuth = (handler) => async (req, res, ...args) => {
  const token = parseTokenFromCookie(req);
  if (!token) {
    return sendUnauthorized(res, "Authentication required");
  }

  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);
    req.user = payload;
    return handler(req, res, ...args);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return sendUnauthorized(res, "Session expired. Please log in again.");
    }
    return sendUnauthorized(res, "Invalid authentication token");
  }
};
