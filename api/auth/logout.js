import jwt from "jsonwebtoken";

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// ---------------------------------------------------------------------------
// Token Blacklist (In-memory store - replace with Redis/database in production)
// ---------------------------------------------------------------------------

const tokenBlacklist = new Set();

// Optional: Token blacklist cleanup interval (cleanup expired tokens periodically)
const BLACKLIST_CLEANUP_INTERVAL = parseInt(process.env.BLACKLIST_CLEANUP_INTERVAL) || 3600000; // 1 hour

// Cleanup expired tokens from blacklist
const cleanupExpiredTokens = () => {
  const now = Math.floor(Date.now() / 1000);
  for (const entry of tokenBlacklist) {
    try {
      const token = entry;
      const tokenParts = token.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
        if (payload.exp && payload.exp < now) {
          tokenBlacklist.delete(token);
        }
      }
    } catch (e) {
      // If parsing fails, keep the entry
    }
  }
};

// Start periodic cleanup
let cleanupInterval = null;
const startCleanupInterval = () => {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredTokens, BLACKLIST_CLEANUP_INTERVAL);
    // Don't let this prevent the process from exiting
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }
};

// Start the cleanup interval
startCleanupInterval();

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const corsHeaders = (req) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const requestOrigin = req.headers?.origin;

  let corsOrigin = allowedOrigin || "*";
  if (allowedOrigin && requestOrigin !== allowedOrigin) {
    console.warn(`[CORS] Origin mismatch - Request: ${requestOrigin}, Allowed: ${allowedOrigin}`);
  }
  if (allowedOrigin && allowedOrigin !== "*") {
    corsOrigin = allowedOrigin;
  }

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
};

const corsResponse = (res, status, data, req) => {
  return res.status(status).set(corsHeaders(req)).json(data);
};

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
  return tokenBlacklist.has(token);
};

// ---------------------------------------------------------------------------
// Add token to blacklist
// ---------------------------------------------------------------------------

const blacklistToken = (token) => {
  tokenBlacklist.add(token);
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
    // -----------------------------------------------------------------------
    // Extract and validate token from Authorization header
    // -----------------------------------------------------------------------

    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return corsResponse(res, 401, { 
        error: "Authentication required. No token provided." 
      }, req);
    }

    // -----------------------------------------------------------------------
    // Verify token is valid
    // -----------------------------------------------------------------------

    const authResult = authenticateToken(token);
    
    if (!authResult.valid) {
      return corsResponse(res, 401, { 
        error: authResult.error 
      }, req);
    }

    // -----------------------------------------------------------------------
    // Blacklist the token (invalidate it)
    // -----------------------------------------------------------------------

    blacklistToken(token);

    // -----------------------------------------------------------------------
    // Return success response
    // -----------------------------------------------------------------------

    return corsResponse(res, 200, {
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
    }, req);

  } catch (error) {
    console.error("Logout Error:", error);
    return corsResponse(res, 500, { 
      error: "Internal server error. Please try again later." 
    }, req);
  }
}

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