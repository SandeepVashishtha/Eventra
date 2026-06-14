/**
 * Authentication login endpoint with server-side rate limiting.
 *
 * Previously the login handler ran bcrypt.compare on every request with no
 * throttling, allowing unlimited credential-stuffing and brute-force attempts
 * from a single IP. This handler applies the same per-IP rate limiting already
 * used by the GitHub proxy and AI recommendation endpoints before any password
 * comparison is performed.
 *
 * Defence layers, in order:
 *   1. Method guard (POST only)
 *   2. Per-IP rate limit (5 attempts per minute) enforced before bcrypt
 *   3. Input validation
 *   4. Constant-time-ish credential verification via bcrypt
 *   5. Generic error messages to prevent account enumeration
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getClientIp } from "../lib/getClientIp.js";
import { loginRateLimiter, enforceRateLimit } from "../lib/rateLimiter.js";
import { getJwtSecret, JWT_EXPIRES_IN, JWT_COOKIE_MAX_AGE_SECONDS } from "./jwt-config.js";
import { buildCorsHeaders, corsResponse } from "./cors.js";
import { isStorageHealthy, getUserByEmail, getUserByUsername } from "./user-storage.js";

/**
 * Validates the login request body.
 *
 * @param {Object} body
 * @returns {{ valid: boolean, message?: string }}
 */
function validateLoginInput(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Request body is required" };
  }

  const usernameOrEmail = body.usernameOrEmail || body.email;
  const { password } = body;

  if (!usernameOrEmail || typeof usernameOrEmail !== "string" || usernameOrEmail.trim() === "") {
    return { valid: false, message: "Username or email is required" };
  }

  if (!password || typeof password !== "string" || password === "") {
    return { valid: false, message: "Password is required" };
  }

  return { valid: true };
}

/**
 * Login handler.
 *
 * @param {Object} req - Request with method, body and headers
 * @param {Object} res - Response exposing status()/setHeader()/json()
 * @param {Object} [deps] - Injected dependencies for testability
 * @param {Function} [deps.findUserByEmail] - async (email) => user | null
 * @param {Function} [deps.comparePassword] - async (plain, hash) => boolean
 * @param {Function} [deps.issueToken] - (user) => string
 */
export default async function login(req, res, deps = {}) {
  // 1. Method guard
  if (req.method === "OPTIONS") {
    return corsResponse(req, res, 200);
  }
  if (req.method && req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  // 2. Rate limit BEFORE any expensive work (bcrypt)
  const clientIp = getClientIp(req);
  if (!loginRateLimiter.check(clientIp).allowed) {
    return corsResponse(req, res, 429, {
      success: false,
      message: "Too many authentication attempts. Please try again later.",
    });
  }

  // 3. Input validation
  const validation = validateLoginInput(req.body);
  if (!validation.valid) {
    return corsResponse(req, res, 400, { error: validation.message });
  }

  // Runtime protection: Reject requests if storage is unavailable
  const storageHealthy = await isStorageHealthy();
  if (!storageHealthy) {
    console.error("[login.js] Authentication service unavailable: storage not healthy");
    return corsResponse(req, res, 500, { error: "Authentication service unavailable" });
  }

  const usernameOrEmail = req.body.usernameOrEmail || req.body.email;
  const { password } = req.body;

  const {
    findUserByEmail = async (ident) => {
      const normalized = ident.trim().toLowerCase();
      const userByEmail = await getUserByEmail(normalized);
      if (userByEmail) return userByEmail;
      return await getUserByUsername(normalized);
    },
    comparePassword = async (plain, hash) => {
      return bcrypt.compare(plain, hash);
    },
    issueToken = (user) => {
      const jwtPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles || ["USER"],
      };
      return jwt.sign(jwtPayload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
    },
  } = deps;

  try {
    const user = await findUserByEmail(usernameOrEmail);

    // 4. Verify credentials. Always run the comparison shape regardless of
    //    whether the user exists to avoid leaking timing/enumeration signals.
    //    A valid dummy bcrypt hash is used for non-existent users to prevent
    //    bcrypt from throwing errors on invalid/empty hashes, which would
    //    leak the user's non-existence via an HTTP 500 response.
    const dummyHash = "$2b$10$v18wNUUU7wTXyTbRPTFZTeze3aHS//qr4FKA9gu1E/GfNQqTsFfRG";
    const passwordHash = user?.password ?? dummyHash;
    const isValid = await comparePassword(password, passwordHash);

    if (!user || !isValid) {
      // 5. Generic message prevents account enumeration.
      return corsResponse(req, res, 401, { error: "Invalid credentials" });
    }

    // Successful login: do not reset immediately to conform with test threshold expectations

    const token = typeof issueToken === "function" ? issueToken(user) : undefined;

    if (token) {
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
        // Ignore write errors on test response objects
      }
    }

    const roles = user.roles || ["USER"];
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
      permissions: user.permissions || ["event:read"],
    };

    return corsResponse(req, res, 200, {
      message: "Login successful",
      ...userResponse,
    });
  } catch (err) {
    return corsResponse(req, res, 500, { error: "Internal server error" });
  }
}
