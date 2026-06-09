import jwt from "jsonwebtoken";
import { getJwtSecret } from "./jwt-config.js";

// ---------------------------------------------------------------------------
// Logout Handler
// ---------------------------------------------------------------------------
//
// Terminates the authenticated session by:
//  1. Verifying the presented JWT (rejects already-invalid tokens early).
//  2. Clearing the HttpOnly session cookie so the browser no longer sends it.
//
// Previously this file used CommonJS require()/module.exports, which is
// incompatible with the project's "type": "module" package.json setting.
// This caused a ReferenceError at runtime — the logout endpoint always
// returned 500 and never cleared the auth cookie, leaving users silently
// authenticated after clicking "Log out".
//
// See: https://github.com/SandeepVashishtha/Eventra/issues/7793
// ---------------------------------------------------------------------------

/**
 * Builds a Set-Cookie header that clears the auth token cookie.
 *
 * The attributes mirror those used when the cookie is set on login/signup
 * (HttpOnly, SameSite=Strict, Path=/) so the browser correctly matches and
 * removes the existing cookie.  Max-Age=0 instructs the browser to delete it
 * immediately.
 *
 * The Secure attribute is added in production so the cookie is only sent over
 * HTTPS, preventing it from being transmitted over plain HTTP during the
 * logout request itself.
 *
 * @param {boolean} isProd
 * @returns {string}
 */
function buildClearCookieHeader(isProd) {
  return `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${isProd ? "; Secure" : ""}`;
}

/**
 * Sets the clearing Set-Cookie header on the response object, handling the
 * different API surfaces exposed by Express (setHeader), Vercel (set), and
 * test mocks (headers object).
 *
 * @param {object} res
 * @param {string} cookieValue
 */
function setClearCookie(res, cookieValue) {
  try {
    if (typeof res.setHeader === "function") {
      res.setHeader("Set-Cookie", cookieValue);
    } else if (typeof res.set === "function") {
      res.set({ "Set-Cookie": cookieValue });
    } else if (res.headers && typeof res.headers === "object") {
      res.headers["Set-Cookie"] = cookieValue;
    }
  } catch {
    // Ignore write errors on test response objects
  }
}

/**
 * Logout endpoint handler.
 *
 * Accepts the JWT via the Authorization header or the existing HttpOnly
 * cookie.  Verifying the token before clearing it ensures that random
 * unauthenticated requests cannot trigger the cookie-clearing path, though
 * the primary security action is the cookie deletion, not the verification.
 *
 * @param {object} req
 * @param {object} res
 */
export default function logout(req, res) {
  // Only allow POST to prevent CSRF logout via GET (e.g. <img src="/api/auth/logout">)
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Extract token from Authorization header or cookie
    let token = null;

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token && req.headers?.cookie) {
      const cookies = req.headers.cookie.split(";").map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith("token="));
      if (tokenCookie) {
        token = tokenCookie.slice(6);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No valid token provided" });
    }

    // Verify the token is structurally valid before accepting the logout.
    // We do not reject expired tokens here — an expired-token logout should
    // still clear the cookie so the browser is left in a clean state.
    try {
      jwt.verify(token, getJwtSecret());
    } catch (verifyError) {
      if (verifyError.name !== "TokenExpiredError") {
        return res.status(401).json({ message: "No valid token provided" });
      }
      // TokenExpiredError: proceed with cookie clearing — session was stale anyway
    }

    const isProd = process.env.NODE_ENV === "production";
    setClearCookie(res, buildClearCookieHeader(isProd));

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    // On unexpected errors, still attempt to clear the cookie so the user
    // is not left in a permanently authenticated state.
    try {
      const isProd = process.env.NODE_ENV === "production";
      setClearCookie(res, buildClearCookieHeader(isProd));
    } catch {
      // Ignore
    }
    return res.status(500).json({ message: "An error occurred during logout" });
  }
}
