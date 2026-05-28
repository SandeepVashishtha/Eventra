import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret, JWT_EXPIRES_IN } from "./jwt-config.js";

// ---------------------------------------------------------------------------
// In-memory user storage (replace with database in production)
// ---------------------------------------------------------------------------

const users = new Map();

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = getJwtSecret();

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
// CORS Headers
// ---------------------------------------------------------------------------

const corsHeaders = (req) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const requestOrigin = req.headers?.origin;

  const corsOrigin = allowedOrigin || "*";
  if (allowedOrigin && requestOrigin !== allowedOrigin) {
    console.warn(`[CORS] Origin mismatch - Request: ${requestOrigin}, Allowed: ${allowedOrigin}`);
  }

  // Access-Control-Allow-Credentials must not be sent with a wildcard origin.
  // Per the CORS spec, browsers reject credentialed responses when the reflected
  // origin is "*". Only set the header when a specific origin is configured.
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
// Generate User ID
// ---------------------------------------------------------------------------

let userIdCounter = 1;
const generateUserId = () => `user_${Date.now()}_${userIdCounter++}`;

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
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // -----------------------------------------------------------------------
    // Input Validation
    // -----------------------------------------------------------------------

    // Validate firstName
    const firstNameValidation = validateName(firstName);
    if (!firstNameValidation.valid) {
      return corsResponse(res, 400, { error: `First name: ${firstNameValidation.message}` }, req);
    }

    // Validate lastName
    const lastNameValidation = validateName(lastName);
    if (!lastNameValidation.valid) {
      return corsResponse(res, 400, { error: `Last name: ${lastNameValidation.message}` }, req);
    }

    // Validate email
    if (!email || !email.trim()) {
      return corsResponse(res, 400, { error: "Email is required" }, req);
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return corsResponse(res, 400, { error: "Invalid email format" }, req);
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return corsResponse(res, 400, { error: passwordValidation.message }, req);
    }

    // Validate confirmPassword matches password
    if (!confirmPassword) {
      return corsResponse(res, 400, { error: "Please confirm your password" }, req);
    }
    if (password !== confirmPassword) {
      return corsResponse(res, 400, { error: "Passwords do not match" }, req);
    }

    // -----------------------------------------------------------------------
    // Check for duplicate email
    // -----------------------------------------------------------------------

    if (users.has(normalizedEmail)) {
      return corsResponse(res, 409, { error: "An account with this email already exists" }, req);
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

    // -----------------------------------------------------------------------
    // Generate JWT token
    // -----------------------------------------------------------------------

    const jwtPayload = {
      id: newUser.id,
      email: newUser.email,
      roles: newUser.roles,
      permissions: newUser.permissions,
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

    return corsResponse(res, 201, {
      message: "Account created successfully",
      token,
      ...userResponse,
    }, req);

  } catch (error) {
    console.error("Signup Error:", error);
    return corsResponse(res, 500, { error: "Internal server error. Please try again later." }, req);
  }
}

// ---------------------------------------------------------------------------
// Export users map for sharing with login.js (development purposes)
// In production, replace with actual database
// ---------------------------------------------------------------------------

export { users };
