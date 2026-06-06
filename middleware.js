// ---------------------------------------------------------------------------
// Vercel Edge Middleware — runs on every request before the destination
// handler (rewrite, serverless function, or static file).
//
// The /api/:path* rewrite sends all API traffic directly to the external
// Azure backend, bypassing the serverless auth & rate-limit functions in
// /api/*.js. This middleware restores edge-level abuse protection for
// those proxied requests.
//
// Rate limiting uses the Vercel KV REST API directly via fetch so it works
// in the Edge Runtime. (@vercel/kv uses Node.js internals and is not
// allowed in Edge Middleware.)
//
// If KV_REST_API_URL / KV_REST_API_TOKEN are not set (no KV store
// provisioned) the middleware gracefully skips rate limiting.
//
// Setup:
//   1. npx vercel link && npx vercel env pull
//   2. vercel kv create <store-name>   (sets KV_REST_API_URL / KV_REST_API_TOKEN)
// ---------------------------------------------------------------------------

// Fix (Issue #7650): Import jwtVerify from jose — an Edge Runtime compatible
// JWT library that performs full HMAC-SHA256 signature verification before
// trusting any claims in the payload. The previous atob() decode was
// completely unsigned — any attacker could forge {"roles":["ADMIN"]} with any
// secret and bypass the RBAC check entirely.
import { jwtVerify } from "jose";

const API_RATE_LIMIT = 60;     // max requests
const API_RATE_WINDOW_S = 60;  // per window in seconds

// ---------------------------------------------------------------------------
// Distributed rate limiter — calls the KV REST API via fetch (Edge-safe).
// Returns false (not limited) when KV is not configured.
// ---------------------------------------------------------------------------

const isRateLimited = async (ip) => {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // Graceful degradation: no KV store provisioned → skip rate limiting
  if (!kvUrl || !kvToken) return false;

  const key = `rl:${ip}`;
  const headers = {
    Authorization: `Bearer ${kvToken}`,
    "Content-Type": "application/json",
  };

  // INCR is atomic — safe across concurrent Edge invocations
  const incrRes = await fetch(`${kvUrl}/incr/${key}`, {
    method: "POST",
    headers,
  });
  if (!incrRes.ok) return false;

  const { result: count } = await incrRes.json();

  if (count === 1) {
    // First request in this window: set TTL so the key auto-evicts
    await fetch(`${kvUrl}/expire/${key}/${API_RATE_WINDOW_S}`, {
      method: "POST",
      headers,
    });
  }

  return count > API_RATE_LIMIT;
};

// ---------------------------------------------------------------------------
export const config = {
  matcher: "/api/:path*",
};

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), display-capture=()",
};

const addSecurityHeaders = (headers) => {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
};

// ---------------------------------------------------------------------------
// Fix (Issue #7650): verifyJwt replaces the insecure atob() decode.
//
// BEFORE (vulnerable):
//   const payloadStr = atob(token.split('.')[1]);
//   const payload = JSON.parse(payloadStr);
//   roles = payload.roles || [];
//
// The above only base64-decodes the payload — it never checks the signature.
// An attacker can craft any payload e.g. {"roles":["ADMIN"]}, sign it with
// a random secret or "alg":"none", and the middleware would accept it.
//
// AFTER (fixed):
//   jwtVerify() from jose performs full HMAC-SHA256 signature verification
//   using the shared JWT_SECRET env variable before returning the payload.
//   Any token with a tampered payload or wrong secret throws an error,
//   which is caught and treated as unauthenticated (roles = []).
// ---------------------------------------------------------------------------
const verifyJwt = async (token) => {
  const jwtSecret = process.env.JWT_SECRET;

  // If JWT_SECRET is not configured, fail closed — deny all access rather
  // than falling back to the insecure atob() path.
  if (!jwtSecret) {
    console.error("[middleware] JWT_SECRET env variable is not set. Denying access.");
    return [];
  }

  const secret = new TextEncoder().encode(jwtSecret);

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.roles || [];
  } catch (err) {
    // Covers: invalid signature, expired token, malformed token, alg:none attacks
    console.warn("[middleware] JWT verification failed:", err.code || err.message);
    return [];
  }
};

export default async function middleware(request) {
  const url = new URL(request.url);

  // Skip preflight — let the backend handle CORS
  if (request.method === "OPTIONS") {
    return;
  }

  // Per-IP rate limiting at the edge
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (await isRateLimited(ip)) {
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
      "Retry-After": String(API_RATE_WINDOW_S),
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

  // RBAC for ticket routes
  if (url.pathname.startsWith("/api/tickets/")) {
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    let roles = [];
    if (token) {
      // Fix (Issue #7650): Use verifyJwt() instead of raw atob() decode.
      // Forged tokens with arbitrary payloads will be rejected before
      // roles are trusted.
      roles = await verifyJwt(token);
    }

    const hasAccess = roles.some(role =>
      ["ORGANIZER", "VOLUNTEER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"].includes(role.toUpperCase())
    );

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Insufficient permissions for ticket routes" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": url.origin,
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }
  }

  // Allow the request to proceed to the rewrite destination
  return;
}