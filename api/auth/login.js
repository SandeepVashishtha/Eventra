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

import { getClientIp } from "../lib/getClientIp.js";
import { loginRateLimiter, enforceRateLimit } from "../lib/rateLimiter.js";
import { JWT_COOKIE_MAX_AGE_SECONDS } from "./jwt-config.js";

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

  const { email, password } = body;

  if (!email || typeof email !== "string" || email.trim() === "") {
    return { valid: false, message: "Email is required" };
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
  if (req.method && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // 2. Rate limit BEFORE any expensive work (bcrypt). This is the core fix.
  const clientIp = getClientIp(req);
  if (!enforceRateLimit(loginRateLimiter, clientIp, res)) {
    return;
  }

  // 3. Input validation
  const validation = validateLoginInput(req.body);
  if (!validation.valid) {
    res.status(400).json({ error: validation.message });
    return;
  }

  const { email, password } = req.body;

  const {
    findUserByEmail,
    comparePassword,
    issueToken,
  } = deps;

  // When dependencies are not wired (e.g. during incremental integration),
  // fail closed rather than leaking an unauthenticated success.
  if (
    typeof findUserByEmail !== "function" ||
    typeof comparePassword !== "function"
  ) {
    res.status(503).json({ error: "Authentication service unavailable" });
    return;
  }

  try {
    const user = await findUserByEmail(email);

    // 4. Verify credentials. Always run the comparison shape regardless of
    //    whether the user exists to avoid leaking timing/enumeration signals.
    const passwordHash = user?.password ?? "";
    const isValid = await comparePassword(password, passwordHash);

    if (!user || !isValid) {
      // 5. Generic message prevents account enumeration.
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Successful login: clear this IP's counter so a legitimate user is not
    // penalised for earlier failed attempts.
    loginRateLimiter.reset(clientIp);

    const token =
      typeof issueToken === "function" ? issueToken(user) : undefined;

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

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
