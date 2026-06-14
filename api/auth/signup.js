import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { getJwtSecret, JWT_EXPIRES_IN, JWT_COOKIE_MAX_AGE_SECONDS } from "./_jwt-config.js";
import { signupRateLimiter } from "../_lib/rateLimiter.js";
import { buildCorsHeaders, corsResponse } from "./_cors.js";
import { assertPersistentStorageConfigured } from "./_storage-config.js";
import { createUser, getUserByEmail, isStorageHealthy } from "./_user-storage.js";


// ---------------------------------------------------------------------------
// In-memory user storage
// ---------------------------------------------------------------------------
// Storage Configuration
// ---------------------------------------------------------------------------
// Fail-fast: Prevent production startup without persistent storage
assertPersistentStorageConfigured();

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

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const MAX_SIGNUP_BODY_SIZE = 5120; // 5KB

const validateEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/\d/, "Password must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).strip();

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
  const forwarded = req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  const realIp = req.headers?.["x-real-ip"];
  if (realIp) return realIp;
  const socketIp = req.socket?.remoteAddress;
  if (socketIp) return socketIp;
  return "unknown";
}

function validateSignupInput(body) {
  const result = signupSchema.safeParse(body);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { valid: false, error: firstError.message };
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
    // Runtime protection: Reject requests if storage is unavailable
    const storageHealthy = await isStorageHealthy();
    if (!storageHealthy) {
      console.error("[signup.js] Authentication service unavailable: storage not healthy");
      return corsResponse(req, res, 500, { error: "Authentication service unavailable" });
    }

    const contentLength = parseInt(req.headers?.["content-length"] || "0", 10);
    if (contentLength > MAX_SIGNUP_BODY_SIZE) {
      return corsResponse(req, res, 413, { error: "Request body too large" });
    }

    if (!req.body || typeof req.body !== "object") {
      return corsResponse(req, res, 400, { error: "Request body is required" });
    }

    const validation = validateSignupInput(req.body);
    if (!validation.valid) {
      return corsResponse(req, res, 400, { error: validation.error });
    }

    const { firstName, lastName, email, password } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // -----------------------------------------------------------------------
    // Check for duplicate email
    // -----------------------------------------------------------------------

    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
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
<<<<<<< HEAD
      firstName: validateName(firstName).value,
      lastName: validateName(lastName).value,
=======
      firstName: firstName,
      lastName: lastName,
>>>>>>> 9c4e90d1 (fix(#8864): add Zod schema validation to reject unexpected fields in signup)
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

    // Store user using storage abstraction layer
    await createUser(newUser);

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

export default handler;

