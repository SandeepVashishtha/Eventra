import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret, JWT_EXPIRES_IN, JWT_COOKIE_MAX_AGE_SECONDS } from "./jwt-config.js";
import { createRateLimiter, signupRateLimiter } from "../lib/rateLimiter.js";
import { buildCorsHeaders, corsResponse } from "./cors.js";
import { assertPersistentStorageConfigured, isInMemoryStorageAllowed } from "./storage-config.js";


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

// Fail-fast: Prevent production startup without persistent storage
assertPersistentStorageConfigured();

// Only create in-memory Maps if allowed (development/testing)
let users, usersById, usersByUsername;
if (isInMemoryStorageAllowed()) {
  users = new Map();
  usersById = new Map();
  usersByUsername = new Map();
} else {
  // Production: Maps remain undefined - must use persistent storage
  users = null;
  usersById = null;
  usersByUsername = null;
}

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = getJwtSecret();

// ---------------------------------------------------------------------------
// Rate Limiting (IP-based, 5 signups per minute)
// ---------------------------------------------------------------------------
// signupRateLimiter is imported from ../lib/rateLimiter.js

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
  
  const criteria = [
    /.{8,}/,
    /[A-Z]/,
    /[a-z]/,
    /\d/,
    /[!@#$%^&*(),.?":{}|<>]/,
  ];
  
  const metCriteria = criteria.filter(c => c.test(password));
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

function setCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  const cookieValue = `token=${token}; HttpOnly; Path=/; Max-Age=${JWT_COOKIE_MAX_AGE_SECONDS}; SameSite=Strict${isProd ? '; Secure' : ''}`;
  try {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Set-Cookie', cookieValue);
    } else if (typeof res.set === 'function') {
      res.set({ 'Set-Cookie': cookieValue });
    } else if (res.headers && typeof res.headers === 'object') {
      res.headers['Set-Cookie'] = cookieValue;
    }
  } catch (e) {
  }
}

function getClientIp(req) {
  return req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim()
    || req.headers?.["x-real-ip"]
    || req.socket?.remoteAddress
    || "unknown";
}

function validateSignupInput(body) {
  const { firstName, lastName, email, password, confirmPassword } = body;
  const errors = [];
  
  const firstNameValidation = validateName(firstName);
  if (!firstNameValidation.valid) errors.push(`First name: ${firstNameValidation.message}`);
  
  const lastNameValidation = validateName(lastName);
  if (!lastNameValidation.valid) errors.push(`Last name: ${lastNameValidation.message}`);
  
  if (!email || !email.trim()) errors.push("Email is required");
  
  if (password) {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) errors.push(passwordValidation.message);
  }
  
  if (!confirmPassword) errors.push("Please confirm your password");
  if (password && confirmPassword && password !== confirmPassword) errors.push("Passwords do not match");
  
  return errors;
}

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
    if (!users || !usersById || !usersByUsername) {
      console.error("[signup.js] Authentication service unavailable: storage not initialized");
      return corsResponse(req, res, 500, { error: "Authentication service unavailable" });
    }

    if (!req.body || typeof req.body !== "object") {
      return corsResponse(req, res, 400, { error: "Request body is required" });
    }

    const { firstName, lastName, email, password, confirmPassword } = req.body;
    const validationErrors = validateSignupInput(req.body);
    if (validationErrors.length > 0) {
      return corsResponse(req, res, 400, { error: validationErrors[0] });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return corsResponse(req, res, 400, { error: "Invalid email format" });
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

    const clientIp = getClientIp(req);

    try {
      const rateLimitResult = signupRateLimiter.checkAsync
        ? await signupRateLimiter.checkAsync(clientIp)
        : signupRateLimiter.check(clientIp);
      
      if (!rateLimitResult.allowed) {
        return corsResponse(req, res, 429, {
          error: "Too many signup attempts. Please try again later.",
          retryAfter: 60,
        });
      }
    } catch (rateLimitError) {
      console.error('[signup] Rate limit check failed:', rateLimitError.message);
      return corsResponse(req, res, 500, {
        error: "Rate limiting service unavailable. Please try again later.",
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
    if (!users || !usersById || !usersByUsername) {
      console.error("[signup.js] Authentication service unavailable: storage not initialized");
      return corsResponse(req, res, 500, { error: "Authentication service unavailable" });
    }
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

    setCookie(res, token);

    return corsResponse(req, res, 201, {
      message: "Account created successfully",
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
export { users, usersById, usersByUsername };

