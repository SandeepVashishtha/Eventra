import bcrypt from "bcryptjs";
import { users } from "./signup.js";
import {
  corsHeaders,
  corsResponse,
  getPermissionsForRoles,
  buildAuthPayload,
  signToken,
  setAuthCookie,
} from "./_shared.js";

// Pre-compute a dummy bcrypt hash at module load time (same cost factor used in signup.js).
// When a login attempt references a username or email that does not exist, we still run
// bcrypt.compare against this hash so the response time is indistinguishable from a real
// failed-password attempt. Without this, an attacker can enumerate valid account identifiers
// purely from response timing (user-not-found path: <5 ms vs valid-user path: ~100 ms).
const DUMMY_HASH_PROMISE = bcrypt.hash("__eventra_dummy_constant__", 12);

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
    return res.status(200).set(corsHeaders(req)).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return corsResponse(res, 405, { error: "Method not allowed" }, req);
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
      }, req);
    }

    // -----------------------------------------------------------------------
    // Find user by username or email
    // -----------------------------------------------------------------------

    const user = findUserByUsernameOrEmail(usernameOrEmail);

    // -----------------------------------------------------------------------
    // Verify password using BCrypt
    // Always run bcrypt.compare regardless of whether the user exists so that
    // response time is uniform across all failure modes. This eliminates the
    // timing side-channel that would otherwise reveal valid account identifiers.
    // -----------------------------------------------------------------------

    const hashToCompare = user ? user.password : await DUMMY_HASH_PROMISE;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      return corsResponse(res, 401, {
        error: "Invalid credentials"
      }, req);
    }

    // Check if user is active after confirming identity to keep timing uniform
    if (user.isActive === false) {
      return corsResponse(res, 401, {
        error: "Invalid credentials"
      }, req);
    }

    // -----------------------------------------------------------------------
    // Get permissions based on roles
    // -----------------------------------------------------------------------

    const roles = user.roles || ["USER"];
    const permissions = getPermissionsForRoles(roles);

    // -----------------------------------------------------------------------
    // Generate JWT token
    // -----------------------------------------------------------------------

    const jwtPayload = buildAuthPayload(user);

    const token = signToken(jwtPayload);

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

    setAuthCookie(res, token);

    return corsResponse(res, 200, {
      message: "Login successful",
      token,
      tokenType: "Bearer",
      ...userResponse,
    }, req);

  } catch (error) {
    console.error("Login Error:", error);
    return corsResponse(res, 500, { 
      error: "Internal server error. Please try again later." 
    }, req);
  }
}

// ---------------------------------------------------------------------------
// Export users map for sharing with signup.js (development purposes)
// In production, replace with actual database
// ---------------------------------------------------------------------------

export { users };
