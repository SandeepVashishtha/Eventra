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

const API_RATE_LIMIT = 60;
const API_RATE_WINDOW_S = 60;

// ---------------------------------------------------------------------------
// JWT verification — uses Web Crypto API (native in Edge Runtime).
// jsonwebtoken depends on Node.js crypto and is NOT available in Edge.
// ---------------------------------------------------------------------------

const base64urlDecode = (str) => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};

const decodeBase64UrlJson = (str) => {
  try {
    const bytes = base64urlDecode(str);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

const verifyJwt = async (token, secret) => {
  if (typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerStr, payloadStr, signatureStr] = parts;

  // Reject non-HS256 tokens (algorithm-confusion protection)
  const header = decodeBase64UrlJson(headerStr);
  if (!header || header.alg !== "HS256") return null;

  // Decode payload for expiry check and role extraction
  const payload = decodeBase64UrlJson(payloadStr);
  if (!payload) return null;

  // Reject expired tokens
  if (payload.exp && payload.exp * 1000 <= Date.now()) return null;

  // Verify HMAC-SHA256 signature using Web Crypto API
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signingInput = `${headerStr}.${payloadStr}`;
    const signatureBytes = base64urlDecode(signatureStr);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(signingInput),
    );

    return valid ? payload : null;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Distributed rate limiter — calls the KV REST API via fetch (Edge-safe).
// Returns false (not limited) when KV is not configured.
// ---------------------------------------------------------------------------

const isRateLimited = async (ip) => {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) return false;

  const key = `rl:${ip}`;
  const headers = {
    Authorization: `Bearer ${kvToken}`,
    "Content-Type": "application/json",
  };

  const incrRes = await fetch(`${kvUrl}/incr/${key}`, {
    method: "POST",
    headers,
  });
  if (!incrRes.ok) return false;

  const { result: count } = await incrRes.json();

  if (count === 1) {
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
  "Strict-Transport-Security":
    "max-age=31536000; includeSubDomains; preload",

  "X-Frame-Options": "DENY",

  "X-Content-Type-Options": "nosniff",

  "Referrer-Policy": "strict-origin-when-cross-origin",

  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), display-capture=()",

  "Content-Security-Policy":
  "default-src 'self'; " +
  "script-src 'self' https://accounts.google.com https://cdn.jsdelivr.net; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "img-src 'self' data: https:; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "connect-src 'self' https://api.github.com https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net; " +
  "frame-src 'self' https://accounts.google.com",
};

const addSecurityHeaders = (headers) => {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
};

const TICKET_ROLES = new Set([
  "ORGANIZER",
  "VOLUNTEER",
  "ADMIN",
  "SUPER_ADMIN",
  "EVENT_MANAGER",
]);

const parseTokenFromCookie = (request) => {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
  return tokenMatch ? tokenMatch[1] : null;
};

const forbiddenResponse = (url) =>
  new Response(
    JSON.stringify({ error: "Forbidden: Insufficient permissions for ticket routes" }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": url.origin,
        "Access-Control-Allow-Credentials": "true",
      },
    },
  );
const BLOCKED_COUNTRIES = ['CU', 'IR', 'KP', 'SY', 'RU'];

export default async function middleware(request) {
  const country = request.geo?.country || 'US';
  if (BLOCKED_COUNTRIES.includes(country)) {
    return new Response(JSON.stringify({ error: "Unavailable For Legal Reasons" }), {
      status: 451,
      headers: { "Content-Type": "application/json" }
    });
  }
  const url = new URL(request.url);

  if (request.method === "OPTIONS") return;

  // Strict Origin Validation
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

  // Session validation for API routes
  if (url.pathname.startsWith("/api/")) {
    const PUBLIC_PATHS = [
      "/api/auth/login",
      "/api/auth/signup",
      "/api/auth/reset-password",
      "/api/events",
      "/api/hackathons",
      "/api/projects",
      "/api/validate"
    ];

    const isPublicPath = PUBLIC_PATHS.some(path => url.pathname.startsWith(path) && (request.method === "GET" || url.pathname.includes("/auth/") || url.pathname.includes("/validate/")));

    if (!isPublicPath) {
      const cookieHeader = request.headers.get("cookie") || "";
      const tokenMatch = cookieHeader.match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
      if (!tokenMatch || !tokenMatch[1]) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Missing active user session" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }
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

  // RBAC for ticket routes — requires a valid, non-expired JWT with a ticket role
  if (url.pathname.startsWith("/api/tickets/")) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      // SECURITY: Fail-closed behavior - reject requests when JWT_SECRET is missing
      // This prevents unauthorized access when configuration is incomplete
      console.error(
        "[middleware] JWT_SECRET is not configured. Rejecting ticket route request."
      );
      return new Response(
        JSON.stringify({
          error: "Server configuration error"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const token = parseTokenFromCookie(request);
    if (!token) return forbiddenResponse(url);

    const payload = await verifyJwt(token, jwtSecret);
    if (!payload) return forbiddenResponse(url);

    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const hasAccess = roles.some((role) =>
      TICKET_ROLES.has(String(role).toUpperCase()),
    );

    if (!hasAccess) return forbiddenResponse(url);
  }

  return;
}