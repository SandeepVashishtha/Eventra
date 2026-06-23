import { createConcurrencyLimiter } from "../api/_lib/concurrency.js";
import { checkGeoBlock } from "./geo.js";
import { checkRateLimit } from "./rate-limit.js";
import { verifyTicketAccess, verifyJwt, parseTokenFromCookie } from "./jwt.js";
import { addSecurityHeaders, validateBackendOrigin, getBackendOrigins, createSecurityHeaders } from "./csp.js";
import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
} from "../api/_lib/rate-limit-config.js";
import { getJwtSecret, createJwtConfigErrorResponse } from "../api/_lib/jwtSecret.js";
import { SESSION_KV_FAILURE_MODE } from "../src/config/env.js";

const validationLimiter = createConcurrencyLimiter(5);

// KV health cache to prevent thundering herd during outages
// Structure: { isHealthy: boolean, lastCheckTime: number }
let kvHealthCache = { isHealthy: true, lastCheckTime: 0 };
const KV_HEALTH_CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Checks if KV storage is currently healthy by attempting a lightweight health check.
 * Results are cached for 30 seconds to prevent excessive KV ping attempts during outages.
 * @returns {Promise<boolean>} true if KV is healthy, false if unavailable or failed
 */
const isKvHealthy = async () => {
  const now = Date.now();
  
  // Return cached result if still valid
  if (now - kvHealthCache.lastCheckTime < KV_HEALTH_CACHE_TTL) {
    return kvHealthCache.isHealthy;
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return false;
  }

  try {
    const res = await fetch(`${kvUrl}/ping`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      timeout: 5000, // 5 second timeout for health check
    });
    
    const isHealthy = res.ok;
    kvHealthCache = { isHealthy, lastCheckTime: now };
    return isHealthy;
  } catch (e) {
    // Network error, timeout, or fetch error - mark as unhealthy
    kvHealthCache = { isHealthy: false, lastCheckTime: now };
    return false;
  }
};

const getSessionRiskState = async (sessionId, userId) => {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  const isProduction = process.env.NODE_ENV === "production";
  const failureMode = SESSION_KV_FAILURE_MODE || "fail_open";

  // Check if distributed storage is configured
  const isDistributedConfigured = isDistributedRateLimitStorageConfigured();
  const isInMemoryAllowed = isInMemoryRateLimitStorageAllowed();

  // Production: Fail closed - require re-authentication if distributed storage is not configured
  if (isProduction && !isDistributedConfigured) {
    console.error(
      "[SECURITY] Session state unavailable: KV_REST_API_URL and KV_REST_API_TOKEN are required in production. Requiring re-authentication."
    );
    return "requires_reauth";
  }

  // Development/Test: Allow active state if distributed storage is not configured
  if (!isDistributedConfigured) {
    if (isInMemoryAllowed) {
      console.warn(
        "[DEV] Session state check skipped (distributed storage not configured). Assuming active session."
      );
      return "active";
    } else {
      // Should not happen, but fail closed if somehow in non-production but in-memory not allowed
      console.error(
        "[SECURITY] Session state unavailable: Distributed storage not configured and in-memory fallback not permitted. Requiring re-authentication."
      );
      return "requires_reauth";
    }
  }

  // Distributed storage is configured - use KV with failure mode handling
  /**
   * KV Failure Mode Logic:
   * - fail_open (default): If KV is unavailable, trust the valid JWT and allow the request.
   *   This prevents a KV outage from breaking authentication for all users.
   *   Risk: Stale session state (e.g., inactivity timeout not enforced). Mitigated by JWT expiry.
   * - fail_closed: If KV is unavailable, require re-authentication (original strict behavior).
   *   Risk: All users logged out during KV outage. Use only if session state accuracy is critical.
   */
  
  try {
    const res = await fetch(`${kvUrl}/get/session:${sessionId}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      timeout: 10000, // 10 second timeout for session data fetch
    });

    if (!res.ok) {
      // KV request failed with bad status code
      if (failureMode === "fail_closed") {
        console.error(
          `[SECURITY] Session state unavailable: KV request failed with status ${res.status}. Requiring re-authentication (fail_closed mode).`
        );
        return "requires_reauth";
      } else {
        // fail_open: Log warning but allow request through
        console.warn(
          JSON.stringify({
            level: "warn",
            message: "KV unavailable, allowing JWT-valid request (fail_open mode)",
            reason: "kv_unavailable",
            userId,
            mode: "fail_open",
            jwtValid: true,
            kvStatus: res.status,
          })
        );
        return "active_unverified"; // Mark as unverified but allow through
      }
    }

    const data = await res.json();
    if (!data || !data.result) return "invalidated";

    let sessionData = data.result;
    if (typeof sessionData === 'string') {
      sessionData = JSON.parse(sessionData);
    }

    // Check inactivity (2 hours)
    if (Date.now() - sessionData.lastActive > 2 * 60 * 60 * 1000 && sessionData.status === "active") {
      return "requires_reauth";
    }
    return sessionData.status || "active";
  } catch (e) {
    // Network error, timeout, or JSON parse error
    if (failureMode === "fail_closed") {
      console.error(
        "[SECURITY] Session state unavailable: KV communication error. Requiring re-authentication (fail_closed mode).",
        e.message
      );
      return "requires_reauth";
    } else {
      // fail_open: Log warning but allow request through
      console.warn(
        JSON.stringify({
          level: "warn",
          message: "KV communication error, allowing JWT-valid request (fail_open mode)",
          reason: "kv_unavailable",
          userId,
          mode: "fail_open",
          jwtValid: true,
          error: e.message,
        })
      );
      return "active_unverified"; // Mark as unverified but allow through
    }
  }
};

export const config = {
  matcher: "/api/:path*",
};

function validateOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return new Response(
          JSON.stringify({ error: "Forbidden: Invalid origin" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Malformed origin" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}

async function authorizeSession(request, url) {
  const PUBLIC_PATHS = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/reset-password",
    "/api/auth/reauth",
    "/api/events",
    "/api/hackathons",
    "/api/projects",
    "/api/validate",
    "/api/health",
  ];

  const isPublicPath = PUBLIC_PATHS.some(path =>
    url.pathname.startsWith(path) &&
    (request.method === "GET" ||
      url.pathname.includes("/auth/") ||
      url.pathname.includes("/validate/"))
  );

  if (!isPublicPath) {
    const token = parseTokenFromCookie(request);
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing active user session" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let jwtSecret;
    try {
      jwtSecret = getJwtSecret();
    } catch (error) {
      return createJwtConfigErrorResponse();
    }

    const payload = await verifyJwt(token, jwtSecret);
    if (!payload) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payload.sessionId) {
      const status = await getSessionRiskState(payload.sessionId, payload.userId);
      if (status === "invalidated") {
         return new Response(JSON.stringify({ error: "Session invalidated" }), { status: 401, headers: { "Content-Type": "application/json" }});
      } else if (status === "requires_reauth") {
         return new Response(JSON.stringify({ error: "Re-authentication required", code: "REQUIRES_REAUTH" }), { status: 401, headers: { "Content-Type": "application/json" }});
      }
      // status === "active" or "active_unverified" - both allow request through
      // "active_unverified" indicates KV was unavailable but JWT was valid
      if (status === "active_unverified") {
        request.sessionRiskChecked = false;
      }
    }
  }
}

async function handleRequest(request) {
  const geoResponse = checkGeoBlock(request);
  if (geoResponse) return geoResponse;

  const url = new URL(request.url);

  if (request.method === "OPTIONS") return;

  const originValidationResponse = validateOrigin(request);
  if (originValidationResponse) return originValidationResponse;

  if (url.pathname.startsWith("/api/")) {
    const authResponse = await authorizeSession(request, url);
    if (authResponse) return authResponse;
  }

  const { limited, window } = await checkRateLimit(request);
  if (limited) {
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
      "Retry-After": String(window),
    });
    addSecurityHeaders(responseHeaders);
    responseHeaders.set("Access-Control-Allow-Origin", url.origin);
    responseHeaders.set("Access-Control-Allow-Credentials", "true");
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: responseHeaders,
      },
    );
  }

  if (url.pathname.startsWith("/api/tickets/")) {
    const ticketResponse = await verifyTicketAccess(request);
    if (ticketResponse) return ticketResponse;
  }

  return;
}

export { validateBackendOrigin, getBackendOrigins } from "./csp.js";

export const SECURITY_HEADERS = {
  get "Strict-Transport-Security"() {
    return "max-age=31536000; includeSubDomains; preload";
  },
  get "X-Frame-Options"() { return "DENY"; },
  get "X-Content-Type-Options"() { return "nosniff"; },
  get "Referrer-Policy"() { return "strict-origin-when-cross-origin"; },
  get "Permissions-Policy"() { return "camera=(), microphone=(), geolocation=(), display-capture=()"; },
  get "Content-Security-Policy"() {
    return createSecurityHeaders()["Content-Security-Policy"];
  }
};

export default async function middleware(request) {
  return validationLimiter.run(() => handleRequest(request));
}
