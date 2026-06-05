import jwt from "jsonwebtoken";
import { getJwtSecret } from "./jwt-config.js";
import { buildCorsHeaders, corsResponse } from "./cors.js";
import { verifyAuth } from "../middleware/auth.js";

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

// Use the same centralised helper as login.js and signup.js so that all three
// handlers share a consistent signing secret.
const JWT_SECRET = getJwtSecret();

// ---------------------------------------------------------------------------
// Token Blacklist
// ---------------------------------------------------------------------------
//
// ARCHITECTURAL LIMITATION: the Set below is process-local. In a serverless
// deployment (Vercel, AWS Lambda, etc.) each cold-start creates a fresh process
// with an empty Set, so a blacklisted token becomes valid again the moment a
// new function instance spins up.
//
// To make logout durable at scale, replace the Set with a shared persistent
// store. The interface is intentionally kept minimal so it can be swapped:
//
//   import { createClient } from "redis";
//   const redis = createClient({ url: process.env.REDIS_URL });
//   await redis.connect();
//
//   const blacklistToken  = (token, ttlSec) => redis.set(`bl:${token}`, 1, { EX: ttlSec });
//   const isTokenBlacklisted = (token) => redis.exists(`bl:${token}`).then(Boolean);
//
// Until a persistent store is wired up, defence-in-depth is provided by:
//  1. Short JWT_EXPIRES_IN (default 7d — set to a smaller value in production).
//  2. The Set-Cookie header sent by the logout response (see handler below),
//     which clears the cookie in the browser regardless of blacklist state.
//  3. The in-process blacklist, which is effective within a single long-running
//     server process (e.g. local development or a non-serverless deployment).

// Map<token, expiryUnixSeconds> — uses the JWT exp claim as the expiry so
// entries are naturally bounded by the token lifetime (default 7d).
// A Map is used instead of Set so we can check expiry at read time without
// iterating, and the cleanup pass can delete entries without mutating during
// iteration (collect keys first, then delete).
const tokenBlacklist = new Map();

const BLACKLIST_CLEANUP_INTERVAL = parseInt(process.env.BLACKLIST_CLEANUP_INTERVAL) || 3600000; // 1 hour

// Cleanup expired tokens from blacklist (runs every hour by default).
// Collects expired keys into an array first, then deletes — avoids mutating
// the Map during iteration (the bug the original Set-based approach had).
const cleanupExpiredTokens = () => {
  const now = Math.floor(Date.now() / 1000);
  const expired = [];
  for (const [token, exp] of tokenBlacklist) {
    if (exp < now) expired.push(token);
  }
  for (const token of expired) {
    tokenBlacklist.delete(token);
  }
};

let cleanupInterval = null;
const startCleanupInterval = () => {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredTokens, BLACKLIST_CLEANUP_INTERVAL);
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }
};

startCleanupInterval();

// ---------------------------------------------------------------------------
// CORS Headers (delegated to shared cors.js)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Extract token from Authorization header
// ---------------------------------------------------------------------------

const extractToken = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  
  return null;
};

// ---------------------------------------------------------------------------
// Check if token is blacklisted
// ---------------------------------------------------------------------------

const isTokenBlacklisted = (token) => {
  const exp = tokenBlacklist.get(token);
  if (exp === undefined) return false;
  // Auto-evict expired entries at read time so stale tokens don't linger
  // until the next cleanup interval.
  if (exp < Math.floor(Date.now() / 1000)) {
    tokenBlacklist.delete(token);
    return false;
  }
  return true;
};

// ---------------------------------------------------------------------------
// Add token to blacklist with auto-expiry based on JWT exp claim
// ---------------------------------------------------------------------------

const blacklistToken = (token) => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const exp = payload.exp ?? Math.floor(Date.now() / 1000) + 7 * 86400;
    tokenBlacklist.set(token, exp);
  } catch {
    // If the token can't be decoded (malformed), keep it for a bounded
    // default TTL so the blacklist can't be spammed with garbage entries.
    tokenBlacklist.set(token, Math.floor(Date.now() / 1000) + 86400);
  }
};

// ---------------------------------------------------------------------------
// Middleware: Authenticate JWT token
// ---------------------------------------------------------------------------

const authenticateToken = (token) => {
  if (!token) {
    return { valid: false, error: "No token provided" };
  }
  
  if (isTokenBlacklisted(token)) {
    return { valid: false, error: "Token has been invalidated" };
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, error: "Token has expired" };
    }
    return { valid: false, error: "Invalid token" };
  }
};

// ---------------------------------------------------------------------------
// Logout Handler
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
    // -----------------------------------------------------------------------
    // Extract token from Authorization header or cookie (req.user populated
    // by verifyAuth — the middleware already validated the user, so we trust
    // either transport)
    // -----------------------------------------------------------------------

    let token = extractToken(req.headers?.authorization || req.headers?.Authorization);

    // Fall back to the token cookie used by login.js and signup.js
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    } else if (!token && req.headers?.cookie) {
      const cookies = req.headers.cookie.split(';').map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      if (tokenCookie) token = tokenCookie.substring(6);
    }

    if (!token) {
      return corsResponse(req, res, 401, { 
        error: "Authentication required. No token provided." 
      });
    }

    // -----------------------------------------------------------------------
    // Blacklist the token (invalidate it)
    // -----------------------------------------------------------------------

    blacklistToken(token);

    // -----------------------------------------------------------------------
    // Clear the session cookie (defence-in-depth for serverless environments
    // where the in-memory blacklist may not survive across cold starts)
    // -----------------------------------------------------------------------

    res.setHeader(
      "Set-Cookie",
      "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict"
    );

    // -----------------------------------------------------------------------
    return corsResponse(req, res, 200, {
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Logout Error:", error);
    return corsResponse(req, res, 500, { 
      error: "Internal server error. Please try again later." 
    });
  }
}

export default verifyAuth(handler);

// ---------------------------------------------------------------------------
// Export utility functions for testing
// ---------------------------------------------------------------------------

export {
  tokenBlacklist,
  isTokenBlacklisted,
  blacklistToken,
  authenticateToken,
  extractToken,
  cleanupExpiredTokens,
};