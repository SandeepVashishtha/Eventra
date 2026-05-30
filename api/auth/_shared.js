import { getJwtSecret, JWT_EXPIRES_IN } from "./jwt-config.js";
import jwt from "jsonwebtoken";

// ---------------------------------------------------------------------------
// CORS utilities
// ---------------------------------------------------------------------------

export const corsHeaders = (req) => {
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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
};

export const corsResponse = (res, status, data, req) => {
  return res.status(status).set(corsHeaders(req)).json(data);
};

// ---------------------------------------------------------------------------
// Default roles and permissions for new users
// ---------------------------------------------------------------------------

export const DEFAULT_ROLES = ["USER"];

export const DEFAULT_PERMISSIONS = [
  "events:view",
  "events:register",
  "projects:view",
  "projects:submit",
  "hackathons:view",
  "hackathons:participate",
  "profile:edit",
  "profile:view",
];

// ---------------------------------------------------------------------------
// Role-based permissions map
// ---------------------------------------------------------------------------

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    "events:view", "events:create", "events:edit", "events:delete", "events:register",
    "hackathons:view", "hackathons:host", "hackathons:participate",
    "projects:view", "projects:submit", "projects:upvote",
    "users:view", "users:edit", "users:delete",
    "analytics:view", "content:moderate",
    "profile:edit", "profile:view",
    "notifications:manage", "admin:access",
  ],
  ADMIN: [
    "events:view", "events:create", "events:edit", "events:delete", "events:register",
    "hackathons:view", "hackathons:host", "hackathons:participate",
    "projects:view", "projects:submit", "projects:upvote",
    "users:view", "analytics:view", "content:moderate",
    "profile:edit", "profile:view",
    "notifications:manage", "admin:access",
  ],
  ORGANIZER: [
    "events:view", "events:create", "events:edit", "events:register",
    "hackathons:view", "hackathons:host", "hackathons:participate",
    "projects:view", "projects:submit", "projects:upvote",
    "analytics:view",
    "profile:edit", "profile:view",
  ],
  VOLUNTEER: [
    "events:view", "events:register",
    "hackathons:view", "hackathons:participate",
    "projects:view", "projects:submit", "projects:upvote",
    "content:moderate",
    "profile:edit", "profile:view",
  ],
  ATTENDEE: [
    "events:view", "events:register",
    "hackathons:view", "hackathons:participate",
    "projects:view", "projects:submit", "projects:upvote",
    "profile:edit", "profile:view",
  ],
  USER: [
    "events:view", "events:register",
    "projects:view", "projects:submit",
    "hackathons:view", "hackathons:participate",
    "profile:edit", "profile:view",
  ],
};

export const getPermissionsForRoles = (roles) => {
  const permissionsSet = new Set();
  roles.forEach((role) => {
    const normalizedRole = role.toUpperCase();
    const perms = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.USER;
    perms.forEach((perm) => permissionsSet.add(perm));
  });
  return Array.from(permissionsSet);
};

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

const JWT_SECRET = getJwtSecret();

export const buildAuthPayload = (user, extra = {}) => {
  const roles = user.roles || DEFAULT_ROLES;
  return {
    id: user.id,
    email: user.email,
    username: user.username || user.email,
    roles,
    permissions: getPermissionsForRoles(roles),
    ...extra,
  };
};

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

export const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  const cookieValue = `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${isProd ? '; Secure' : ''}`;
  try {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Set-Cookie', cookieValue);
    } else if (typeof res.set === 'function') {
      res.set({ 'Set-Cookie': cookieValue });
    } else if (res.headers && typeof res.headers === 'object') {
      res.headers['Set-Cookie'] = cookieValue;
    }
  } catch (e) {
    // Ignore write errors on test response objects
  }
};

export const clearAuthCookie = (res) => {
  res.setHeader(
    "Set-Cookie",
    "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict"
  );
};

// ---------------------------------------------------------------------------
// User ID generation
// ---------------------------------------------------------------------------

export const generateUserId = () => crypto.randomUUID();
