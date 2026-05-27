import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { users } from "./signup.js";

// ---------------------------------------------------------------------------
// Google OAuth Configuration
// ---------------------------------------------------------------------------

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const corsResponse = (res, status, data) => {
  return res.status(status).set(corsHeaders).json(data);
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

let userIdCounter = 1;
const generateUserId = () => `google_user_${Date.now()}_${userIdCounter++}`;

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
    return res.status(200).set(corsHeaders).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return corsResponse(res, 405, { error: "Method not allowed" });
  }

  try {
    const { credential } = req.body;

    // -----------------------------------------------------------------------
    // Input Validation
    // -----------------------------------------------------------------------

    if (!credential) {
      return corsResponse(res, 400, { 
        error: "Google credential is required" 
      });
    }

    // -----------------------------------------------------------------------
    // Verify Google Token
    // -----------------------------------------------------------------------

    const verificationResult = await verifyGoogleToken(credential);
    
    if (!verificationResult.valid) {
      return corsResponse(res, 401, { 
        error: "Invalid or expired Google token" 
      });
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

    return corsResponse(res, 200, {
      message: "Login successful via Google",
      token,
      tokenType: "Bearer",
      ...userResponse,
    });

  } catch (error) {
    console.error("Google OAuth Error:", error);
    return corsResponse(res, 500, { 
      error: "Internal server error. Please try again later." 
    });
  }
}