import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users } from "./signup.js";
import { getJwtSecret, JWT_EXPIRES_IN } from "./jwt-config.js";

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = getJwtSecret();

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

const validateLoginInput = (usernameOrEmail, password) => {
  const errors = [];
  
  if (!usernameOrEmail || !usernameOrEmail.trim()) {
    errors.push("Username or email is required");
  }
  
  if (!password) {
    errors.push("Password is required");
  }
  
  return errors;
};

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
// Default Permissions based on roles
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
// Find user by username or email
// ---------------------------------------------------------------------------

const findUserByUsernameOrEmail = (usernameOrEmail) => {
  const normalizedInput = usernameOrEmail.trim().toLowerCase();
  
  // Search through all users
  for (const [key, user] of users.entries()) {
    if (
      user.email === normalizedInput ||
      user.username === normalizedInput ||
      user.email === usernameOrEmail.trim() ||
      user.username === usernameOrEmail.trim()
    ) {
      return user;
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Login Handler
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
    const { usernameOrEmail, password } = req.body;

    // -----------------------------------------------------------------------
    // Input Validation
    // -----------------------------------------------------------------------

    const validationErrors = validateLoginInput(usernameOrEmail, password);
    if (validationErrors.length > 0) {
      return corsResponse(res, 400, { 
        error: validationErrors.join(", ") 
      });
    }

    // -----------------------------------------------------------------------
    // Find user by username or email
    // -----------------------------------------------------------------------

    const user = findUserByUsernameOrEmail(usernameOrEmail);
    
    if (!user) {
      // Return generic message to prevent user enumeration
      return corsResponse(res, 401, { 
        error: "Invalid credentials" 
      });
    }

    // -----------------------------------------------------------------------
    // Verify password using BCrypt
    // -----------------------------------------------------------------------

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return corsResponse(res, 401, { 
        error: "Invalid credentials" 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return corsResponse(res, 401, { 
        error: "Account is deactivated. Please contact support." 
      });
    }

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
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // -----------------------------------------------------------------------
    // Prepare response (exclude sensitive data)
    // -----------------------------------------------------------------------

    // Normalize role for response (use first role as primary)
    const primaryRole = roles[0] || "ATTENDEE";
    
    // Normalize EVENT_MANAGER to ORGANIZER for frontend compatibility
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
    };

    return corsResponse(res, 200, {
      message: "Login successful",
      token,
      tokenType: "Bearer",
      ...userResponse,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return corsResponse(res, 500, { 
      error: "Internal server error. Please try again later." 
    });
  }
}

// ---------------------------------------------------------------------------
// Export users map for sharing with signup.js (development purposes)
// In production, replace with actual database
// ---------------------------------------------------------------------------

export { users };
