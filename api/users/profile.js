import jwt from "jsonwebtoken";
import { users } from "../auth/signup.js";
import { getJwtSecret } from "../auth/jwt-config.js";

const corsHeaders = (req) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const requestOrigin = req.headers?.origin;

  const corsOrigin = allowedOrigin || "*";
  if (allowedOrigin && requestOrigin !== allowedOrigin) {
    console.warn(`[CORS] Origin mismatch - Request: ${requestOrigin}, Allowed: ${allowedOrigin}`);
  }

  const isSpecificOrigin = corsOrigin !== "*";

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    ...(isSpecificOrigin && { "Access-Control-Allow-Credentials": "true" }),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
};

const corsResponse = (res, status, data, req) => {
  return res.status(status).set(corsHeaders(req)).json(data);
};

const extractCookieToken = (cookieHeader = "") => {
  if (!cookieHeader || typeof cookieHeader !== "string") {
    return null;
  }

  const tokenCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("token="));

  return tokenCookie ? decodeURIComponent(tokenCookie.substring("token=".length)) : null;
};

const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
};

const extractToken = (req) => {
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return (
    extractCookieToken(req.headers?.cookie) ||
    extractBearerToken(req.headers?.authorization || req.headers?.Authorization)
  );
};

const findUserByEmail = (email) => {
  if (!email) {
    return null;
  }

  return users.get(String(email).trim().toLowerCase()) || null;
};

const buildProfileResponse = (decoded) => {
  const storedUser = findUserByEmail(decoded.email);
  const sourceUser = storedUser || decoded;
  const roles = sourceUser.roles || decoded.roles || ["USER"];
  const permissions = sourceUser.permissions || decoded.permissions || [];
  const primaryRole = roles[0] || "USER";

  return {
    id: sourceUser.id || decoded.id,
    firstName: sourceUser.firstName || "",
    lastName: sourceUser.lastName || "",
    email: sourceUser.email || decoded.email || "",
    username: sourceUser.username || decoded.username || decoded.email || "",
    role: primaryRole === "EVENT_MANAGER" ? "ORGANIZER" : primaryRole,
    roles,
    permissions,
    createdAt: sourceUser.createdAt,
    updatedAt: sourceUser.updatedAt,
    emailVerified: sourceUser.emailVerified,
    avatarUrl: sourceUser.avatarUrl,
    provider: sourceUser.provider,
  };
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).set(corsHeaders(req)).end();
  }

  if (req.method !== "GET") {
    return corsResponse(res, 405, { error: "Method not allowed" }, req);
  }

  const token = extractToken(req);

  if (!token) {
    return corsResponse(res, 401, { error: "Unauthorized: Missing authentication token" }, req);
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return corsResponse(res, 200, buildProfileResponse(decoded), req);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return corsResponse(res, 401, { error: "Unauthorized: Token expired", expired: true }, req);
    }

    return corsResponse(res, 401, { error: "Unauthorized: Invalid token" }, req);
  }
}

