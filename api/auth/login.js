import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users, usersByUsername } from "./signup.js";
import { getJwtSecret, JWT_EXPIRES_IN } from "./jwt-config.js";
import { createRateLimiter as createRateLimiterMiddleware } from "../middleware/rateLimiter.js";
import { buildCorsHeaders, corsResponse } from "./cors.js";
import { ROLE_PERMISSIONS, getPermissionsForRoles } from "../lib/permissions.js";


// Pre-compute a dummy bcrypt hash at module load time (same cost factor used in signup.js).
// When a login attempt references a username or email that does not exist, we still run
// bcrypt.compare against this hash so the response time is indistinguishable from a real
// failed-password attempt. Without this, an attacker can enumerate valid account identifiers
// purely from response timing (user-not-found path: <5 ms vs valid-user path: ~100 ms).
const DUMMY_HASH_PROMISE = bcrypt.hash("__eventra_dummy_constant__", 12);

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = getJwtSecret();

// ---------------------------------------------------------------------------
// Rate Limiting (IP-based, 5 attempts per minute)
// ---------------------------------------------------------------------------

const loginRateLimiter = createRateLimiter(60_000, 5);

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
// CORS Headers (delegated to shared cors.js)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Default Permissions based on roles (delegated to shared permissions.js)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Find user by username or email
// ---------------------------------------------------------------------------

const findUserByUsernameOrEmail = (usernameOrEmail) => {
  const normalizedInput = usernameOrEmail.trim().toLowerCase();
  
  // O(1) lookup: try email key first (primary key), then username index
  const byEmail = users.get(normalizedInput);
  if (byEmail) return byEmail;
  
  const byUsername = usersByUsername.get(normalizedInput);
  if (byUsername) return byUsername;
  
  return null;
};

// ---------------------------------------------------------------------------
// Login Handler
// ---------------------------------------------------------------------------

async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).set(buildCorsHeaders(req)).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  try {
    const { usernameOrEmail, password } = req.body;

    // -----------------------------------------------------------------------
    // Rate Limiting (brute-force protection)
    // -----------------------------------------------------------------------

    const clientIp = req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim()
      || req.headers?.["x-real-ip"]
      || req.socket?.remoteAddress
      || "unknown";

    loginRateLimiter.evictStale();

    if (!loginRateLimiter.check(clientIp)) {
      return corsResponse(req, res, 429, {
        error: "Too many login attempts. Please try again later.",
        retryAfter: 60,
      });
    }

    // -----------------------------------------------------------------------
    // Input Validation
    // -----------------------------------------------------------------------

    const validationErrors = validateLoginInput(usernameOrEmail, password);
    if (validationErrors.length > 0) {
      return corsResponse(req, res, 400, { 
        error: validationErrors.join(", ") 
      });
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
      return corsResponse(req, res, 401, {
        error: "Invalid credentials"
      });
    }

    // Check if user is active after confirming identity to keep timing uniform
    if (user.isActive === false) {
      return corsResponse(req, res, 401, {
        error: "Invalid credentials"
      });
    }

    // -----------------------------------------------------------------------
    // Generate JWT token
    // -----------------------------------------------------------------------
    // Only identity claims are embedded in the token. Permissions are
    // intentionally excluded: baking them into a 7-day JWT means a role
    // change (demotion, suspension, permission revocation) cannot take
    // effect until the token naturally expires. Callers that need the
    // current permission set should derive it server-side from the user's
    // roles on every request using getPermissionsForRoles(roles).

    const roles = user.roles || ["USER"];

    const jwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: roles,
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // -----------------------------------------------------------------------
    // Prepare response (exclude sensitive data)
    // -----------------------------------------------------------------------

    // Normalize role for response (use first role as primary)
    const primaryRole = roles[0] || "ATTENDEE";
    
    // Normalize EVENT_MANAGER to ORGANIZER for frontend compatibility
    const normalizedRole = primaryRole === "EVENT_MANAGER" ? "ORGANIZER" : primaryRole;

    // Derive permissions fresh from the user's current roles so the response
    // always reflects the latest role assignment, not a stale token snapshot.
    const permissions = getPermissionsForRoles(roles);

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

    const isProd = process.env.NODE_ENV === "production";
    const cookieValue = `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${isProd ? '; Secure' : ''}`;
    // Set cookie compatibly across test mocks (which may provide `set` instead of `setHeader`)
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

    // Reset rate limit on successful login so a legitimate user is not penalised
    loginRateLimiter.reset(clientIp);

    return corsResponse(req, res, 200, {
      message: "Login successful",
      token,
      tokenType: "Bearer",
      ...userResponse,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return corsResponse(req, res, 500, { 
      error: "Internal server error. Please try again later." 
    });
  }
}

// ---------------------------------------------------------------------------
// Export users map for sharing with signup.js (development purposes)
// In production, replace with actual database
// ---------------------------------------------------------------------------


export default handler;

const loginRateLimiterMiddleware = createRateLimiterMiddleware({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many authentication attempts. Please try again later.",
});

export default loginRateLimiterMiddleware(handler);

export { users };
