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

  // Allow the request to proceed to the rewrite destination
  return;
}