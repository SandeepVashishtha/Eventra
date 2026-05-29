import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { users } from "./signup.js";
import { getJwtSecret, JWT_EXPIRES_IN } from "./jwt-config.js";

// ---------------------------------------------------------------------------
// Google OAuth Configuration
// ---------------------------------------------------------------------------

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error("[google.js] GOOGLE_CLIENT_ID environment variable is not set. Google OAuth will reject all tokens.");
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = getJwtSecret();

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const corsHeaders = (req) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const requestOrigin = req.headers?.origin;

  const corsOrigin = allowedOrigin || "*";
  if (allowedOrigin && requestOrigin !== allowedOrigin) {
    console.warn(`[CORS] Origin mismatch - Request: ${requestOrigin}, Allowed: ${allowedOrigin}`);
  }

  // Access-Control-Allow-Credentials must not be paired with a wildcard origin.
  // Per the CORS specification, browsers reject credentialed responses when the
  // reflected origin is "*". Only set the header when a specific origin is
  // configured — matching the pattern already used in login.js and signup.js.
  const isSpecificOrigin = corsOrigin !== "*";

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    ...(isSpecificOrigin && { "Access-Control-Allow-Credentials": "true" }),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
};

const corsResponse = (res, status, data, req) => {
  return res.status(status).set(corsHeaders(req)).json(data);
};

// ---------------------------------------------------------------------------
// Default Roles and Permissions
// ---------------------------------------------------------------------------

const DEFAULT_ROLES = ["USER"];

const DEFAULT_PERMISSIONS = [
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
// Role Permissions
// ---------------------------------------------------------------------------

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    "events:view",
    "events:create",
    "events:edit",
    "events:delete",
    "events:register",
    "hackathons:view",
    "hackathons:host",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "users:view",
    "users:edit",
    "users:delete",
    "analytics:view",
    "content:moderate",
    "profile:edit",
    "profile:view",
    "notifications:manage",
    "admin:access",
  ],
  ADMIN: [
    "events:view",
    "events:create",
    "events:edit",
    "events:delete",
    "events:register",
    "hackathons:view",
    "hackathons:host",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "users:view",
    "analytics:view",
    "content:moderate",
    "profile:edit",
    "profile:view",
    "notifications:manage",
    "admin:access",
  ],
  ORGANIZER: [
    "events:view",
    "events:create",
    "events:edit",
    "events:register",
    "hackathons:view",
    "hackathons:host",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "analytics:view",
    "profile:edit",
    "profile:view",
  ],
  VOLUNTEER: [
    "events:view",
    "events:register",
    "hackathons:view",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "content:moderate",
    "profile:edit",
    "profile:view",
  ],
  ATTENDEE: [
    "events:view",
    "events:register",
    "hackathons:view",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "profile:edit",
    "profile:view",
  ],
  USER: [
    "events:view",
    "events:register",
    "projects:view",
    "projects:submit",
    "hackathons:view",
    "hackathons:participate",
    "profile:edit",
    "profile:view",
  ],
};

const getPermissionsForRoles = (roles) => {
  const permissionsSet = new Set();
  roles.forEach((role) => {
    const normalizedRole = role.toUpperCase();
    const perms = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.USER;
    perms.forEach((perm) => permissionsSet.add(perm));
  });
  return Array.from(permissionsSet);
};

// ---------------------------------------------------------------------------
// Generate User ID
// ---------------------------------------------------------------------------
//
// The previous implementation combined Date.now() with a module-level
// sequential counter. Both components reset or diverge in a serverless
// environment:
//  - Date.now(): two concurrent cold-start instances can share the same
//    millisecond, producing identical timestamps.
//  - The counter: resets to 1 on every cold start, so instance A and
//    instance B both produce `google_user_<timestamp>_1` for their first
//    new user.
//
// crypto.randomUUID() generates a v4 UUID using the OS CSPRNG. The
// collision probability across the entire UUID space is negligible
// (2^-122 per pair) and is unaffected by cold-start timing.
//
// Node.js 14.17+ and all current Vercel runtimes include crypto.randomUUID().
const generateUserId = () => crypto.randomUUID();

// ---------------------------------------------------------------------------
// Find user by email
// ---------------------------------------------------------------------------

const findUserByEmail = (email) => {
  const normalizedEmail = email.toLowerCase();
  for (const [key, user] of users.entries()) {
    if (user.email === normalizedEmail) {
      return user;
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Verify Google Token
// ---------------------------------------------------------------------------

const verifyGoogleToken = async (credential) => {
  if (!GOOGLE_CLIENT_ID) {
    return { valid: false, error: "Google OAuth is not configured on this server." };
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return { valid: true, payload };
  } catch (error) {
    console.error("Google token verification error:", error);
    return { valid: false, error: "Invalid Google token" };
  }
};

// ---------------------------------------------------------------------------
// Create or update user from Google profile
// ---------------------------------------------------------------------------

const createOrUpdateUserFromGoogle = (googlePayload) => {
  const email = googlePayload.email.toLowerCase();
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    // Update existing user's Google info
    existingUser.googleId = googlePayload.sub;
    existingUser.avatarUrl = googlePayload.picture;
    existingUser.emailVerified = googlePayload.email_verified;
    existingUser.updatedAt = new Date().toISOString();
    return existingUser;
  }

  // Create new user
  const newUser = {
    id: generateUserId(),
    firstName: googlePayload.given_name || "",
    lastName: googlePayload.family_name || "",
    email: email,
    username: email,
    password: null, // No password for Google OAuth users
    roles: DEFAULT_ROLES,
    permissions: getPermissionsForRoles(DEFAULT_ROLES),
    googleId: googlePayload.sub,
    avatarUrl: googlePayload.picture,
    emailVerified: googlePayload.email_verified || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    provider: "google",
  };

  users.set(email, newUser);
  return newUser;
};

// ---------------------------------------------------------------------------
// Google OAuth Handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).set(corsHeaders(req)).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return corsResponse(res, 405, { error: "Method not allowed" }, req);
  }

  try {
    const { credential } = req.body;

    // -----------------------------------------------------------------------
    // Input Validation
    // -----------------------------------------------------------------------

    if (!credential) {
      return corsResponse(res, 400, { 
        error: "Google credential is required" 
      }, req);
    }

    // -----------------------------------------------------------------------
    // Verify Google Token
    // -----------------------------------------------------------------------

    const verificationResult = await verifyGoogleToken(credential);
    
    if (!verificationResult.valid) {
      return corsResponse(res, 401, { 
        error: "Invalid or expired Google token" 
      }, req);
    }

    const googlePayload = verificationResult.payload;

    // -----------------------------------------------------------------------
    // Create or update user
    // -----------------------------------------------------------------------

    const user = createOrUpdateUserFromGoogle(googlePayload);

    // -----------------------------------------------------------------------
    // Get permissions based on roles
    // -----------------------------------------------------------------------

    const roles = user.roles || ["USER"];
    const permissions = getPermissionsForRoles(roles);

    // -----------------------------------------------------------------------
    // Generate JWT token
    // -----------------------------------------------------------------------

    const jwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: roles,
      permissions: permissions,
      provider: user.provider || "google",
      jti: crypto.randomUUID(),
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // -----------------------------------------------------------------------
    // Prepare response (exclude sensitive data)
    // -----------------------------------------------------------------------

    const primaryRole = roles[0] || "ATTENDEE";
    const normalizedRole = primaryRole === "EVENT_MANAGER" ? "ORGANIZER" : primaryRole;

    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: normalizedRole,
      roles: roles,
      permissions: permissions,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      provider: user.provider || "google",
    };

    const isProd = process.env.NODE_ENV === "production";
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${isProd ? '; Secure' : ''}`);

    return corsResponse(res, 200, {
      message: "Login successful via Google",
      ...userResponse,
    }, req);

  } catch (error) {
    console.error("Google OAuth Error:", error);
    return corsResponse(res, 500, { 
      error: "Internal server error. Please try again later." 
    }, req);
  }
}
