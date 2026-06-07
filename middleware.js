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

export default async function middleware(request) {
  const url = new URL(request.url);

  // Skip preflight — let the backend handle CORS
  if (request.method === "OPTIONS") {
    return;
  }

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

  // RBAC for ticket routes
  if (url.pathname.startsWith("/api/tickets/")) {
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    let roles = [];
    if (token) {
      try {
        const payloadStr = atob(token.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        roles = payload.roles || [];
      } catch (e) {
        // Ignore parsing errors (treat as unauthenticated)
      }
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