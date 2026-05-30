import jwt from "jsonwebtoken";
import { getJwtSecret } from "./jwt-config.js";
import {
  tokenRevocationService,
  TokenRevocationStoreError,
} from "./token-revocation.js";

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

// Use the same centralised helper as login.js and signup.js so that all three
// handlers share a consistent signing secret.
const JWT_SECRET = getJwtSecret();

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
// Middleware: Authenticate JWT token
// ---------------------------------------------------------------------------

const authenticateToken = async (token) => {
  if (!token) {
    return { valid: false, error: "No token provided" };
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const isRevoked = await tokenRevocationService.isTokenRevoked(token, decoded);

    if (isRevoked) {
      return { valid: false, error: "Token has been invalidated" };
    }

    return { valid: true, decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, error: "Token has expired" };
    }
    if (error instanceof TokenRevocationStoreError) {
      return { valid: false, error: "Token revocation store unavailable" };
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

    const authResult = await authenticateToken(token);
    
    if (!authResult.valid) {
      if (authResult.error === "Token revocation store unavailable") {
        return corsResponse(res, 503, {
          error: "Authentication service unavailable. Please try again later.",
        }, req);
      }

      return corsResponse(res, 401, { 
        error: authResult.error 
      }, req);
    }

    // -----------------------------------------------------------------------
    // Blacklist the token (invalidate it)
    // -----------------------------------------------------------------------

    try {
      await tokenRevocationService.revokeToken(token, authResult.decoded);
    } catch (error) {
      if (error instanceof TokenRevocationStoreError) {
        return corsResponse(res, 503, {
          error: "Authentication service unavailable. Logout could not be completed.",
        }, req);
      }

      throw error;
    }

    // -----------------------------------------------------------------------
    // Clear the session cookie (defence-in-depth for serverless environments
    // where the in-memory blacklist may not survive across cold starts)
    // -----------------------------------------------------------------------

    res.setHeader(
      "Set-Cookie",
      "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict"
    );

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
  authenticateToken,
  extractToken,
};