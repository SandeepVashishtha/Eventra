import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret, JWT_EXPIRES_IN } from "./jwt-config.js";

import { buildCorsHeaders, corsResponse } from "./cors.js";


// ---------------------------------------------------------------------------
// In-memory user storage
// ---------------------------------------------------------------------------
// WARNING: This Map is module-level and resets to empty on every serverless
// cold start (Vercel, AWS Lambda, etc.). All registered accounts are lost
// on restart, causing previously valid credentials to return 401.
//
// This store is suitable for local development only. For any deployed
// environment, replace this Map with a durable database (Supabase, MongoDB,
// PlanetScale, etc.) and update login.js and google.js accordingly.
//
// See GitHub issue #4195 for full details on the production impact.
// ---------------------------------------------------------------------------

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  // Emit a clear error rather than silently accepting registrations that will
  // vanish on the next cold start. This prevents the confusing 401 behaviour
  // that users experience after a serverless function restart.
  console.error(
    "[signup.js] FATAL: In-memory user store is active in a production environment. " +
    "Set DATABASE_URL to a persistent database to prevent data loss on cold starts."
  );
}

const users = new Map();
const usersById = new Map();
const usersByUsername = new Map();

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = getJwtSecret();

// ---------------------------------------------------------------------------
// Rate Limiting (IP-based, 3 signups per minute)
// ---------------------------------------------------------------------------

const signupRateLimiter = createRateLimiter(60_000, 5);

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name) => {
  const trimmed = name?.trim();
  if (!trimmed) return { valid: false, message: "This field is required" };
  if (trimmed.length < 2) return { valid: false, message: "Must be at least 2 characters" };
  if (trimmed.length > 50) return { valid: false, message: "Must be less than 50 characters" };
  return { valid: true, value: trimmed };
};

const validatePassword = (password) => {
  if (!password) return { valid: false, message: "Password is required" };
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters long" };
  
  // Check password strength (must meet all 5 criteria)
  const criteria = [
    { test: /.{8,}/, name: "8+ characters" },
    { test: /[A-Z]/, name: "uppercase letter" },
    { test: /[a-z]/, name: "lowercase letter" },
    { test: /\d/, name: "number" },
    { test: /[!@#$%^&*(),.?":{}|<>]/, name: "special character" },
  ];
  
  const metCriteria = criteria.filter(c => c.test.test(password));
  if (metCriteria.length < 5) {
    return {
      valid: false,
      message: "Password must meet all 5 security criteria: 8+ characters, uppercase, lowercase, number, and special character"
    };
  }
  
  return { valid: true };
};

// ---------------------------------------------------------------------------
// CORS Headers (delegated to shared cors.js)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Generate User ID
// ---------------------------------------------------------------------------
//
// Replaced Date.now() + sequential counter with crypto.randomUUID().
// The counter-based approach was not collision-safe: two concurrent
// serverless instances cold-starting within the same millisecond both
// produced `user_<timestamp>_1`. See google.js for the full rationale.
const generateUserId = () => crypto.randomUUID();

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
// Signup Handler
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
    if (!req.body || typeof req.body !== "object") {
      return corsResponse(req, res, 400, { error: "Request body is required" });
    }

    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // -----------------------------------------------------------------------
    // Input Validation
    // -----------------------------------------------------------------------

    // Validate firstName
    const firstNameValidation = validateName(firstName);
    if (!firstNameValidation.valid) {
      return corsResponse(req, res, 400, { error: `First name: ${firstNameValidation.message}` });
    }

    // Validate lastName
    const lastNameValidation = validateName(lastName);
    if (!lastNameValidation.valid) {
      return corsResponse(req, res, 400, { error: `Last name: ${lastNameValidation.message}` });
    }

    // Validate email
    if (!email || !email.trim()) {
      return corsResponse(req, res, 400, { error: "Email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return corsResponse(req, res, 400, { error: "Invalid email format" });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return corsResponse(req, res, 400, { error: passwordValidation.message });
    }

    // Validate confirmPassword matches password
    if (!confirmPassword) {
      return corsResponse(req, res, 400, { error: "Please confirm your password" });
    }
    if (password !== confirmPassword) {
      return corsResponse(req, res, 400, { error: "Passwords do not match" });
    }

    // -----------------------------------------------------------------------
    // Check for duplicate email
    // -----------------------------------------------------------------------

    if (users.has(normalizedEmail)) {
      return corsResponse(req, res, 409, { error: "An account with this email already exists" });
    }

    // -----------------------------------------------------------------------
    // Rate Limiting (signup spam protection)
    // Run after input validation so malformed requests don't burn the budget.
    // -----------------------------------------------------------------------

    const clientIp = req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim()
      || req.headers?.["x-real-ip"]
      || req.socket?.remoteAddress
      || "unknown";

    signupRateLimiter.evictStale();

    if (!signupRateLimiter.check(clientIp)) {
      return corsResponse(req, res, 429, {
        error: "Too many signup attempts. Please try again later.",
        retryAfter: 60,
      });
    }

    // -----------------------------------------------------------------------
    // Hash password using BCrypt
    // -----------------------------------------------------------------------

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // -----------------------------------------------------------------------
    // Create user object
    // -----------------------------------------------------------------------

    const userId = generateUserId();
    const createdAt = new Date().toISOString();

    const newUser = {
      id: userId,
      firstName: firstNameValidation.value,
      lastName: lastNameValidation.value,
      email: normalizedEmail,
      username: normalizedEmail, // Use email as username
      password: hashedPassword,
      roles: DEFAULT_ROLES,
      permissions: DEFAULT_PERMISSIONS,
      createdAt,
      updatedAt: createdAt,
      emailVerified: false,
      isActive: true,
    };

    // Store user (in production, save to database)
    users.set(normalizedEmail, newUser);
    usersById.set(userId, newUser);
    if (newUser.username) {
      usersByUsername.set(newUser.username.toLowerCase(), newUser);
    }

    // -----------------------------------------------------------------------
    // Generate JWT token
    // -----------------------------------------------------------------------

    const jwtPayload = {
      id: newUser.id,
      email: newUser.email,
      roles: newUser.roles,
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // -----------------------------------------------------------------------
    // Prepare response (exclude sensitive data)
    // -----------------------------------------------------------------------

    const userResponse = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      username: newUser.username,
      roles: newUser.roles,
      permissions: newUser.permissions,
      createdAt: newUser.createdAt,
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

    return corsResponse(req, res, 201, {
      message: "Account created successfully",
      token,
      tokenType: "Bearer",
      ...userResponse,
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return corsResponse(req, res, 500, { error: "Internal server error. Please try again later." });
  }
}

// ---------------------------------------------------------------------------
// Export users map for sharing with login.js (development purposes)
// In production, replace with actual database
// ---------------------------------------------------------------------------

export default handler;

export { users };

export { users, usersById, usersByUsername };

