// ---------------------------------------------------------------------------
// Vercel Edge Middleware — runs on every request before the destination
// handler (rewrite, serverless function, or static file).
//
// The /api/:path* rewrite sends all API traffic directly to the external
// Azure backend, bypassing the serverless auth & rate-limit functions in
// /api/*.js. This middleware restores edge-level abuse protection for
// those proxied requests.
//
// Rate limiting uses @vercel/kv (Redis) so the counter is shared across
// all global Edge nodes. The previous in-memory Map was per-process and
// silently ineffective in a distributed Edge environment.
//
// Setup:
//   1. npx vercel link && npx vercel env pull
//   2. vercel kv create <store-name>   (sets KV_REST_API_URL / KV_REST_API_TOKEN)
// ---------------------------------------------------------------------------

import { kv } from "@vercel/kv";

const API_RATE_LIMIT = 60;         // max requests
const API_RATE_WINDOW_S = 60;      // per window in seconds (Redis TTL unit)

// ---------------------------------------------------------------------------
// Distributed rate limiter using Redis INCR + EXPIRE (atomic sliding window)
// ---------------------------------------------------------------------------

const isRateLimited = async (ip) => {
  const key = `rl:${ip}`;
  // INCR is atomic — safe across concurrent Edge invocations
  const count = await kv.incr(key);
  if (count === 1) {
    // First request in this window: set expiry so key auto-evicts
    await kv.expire(key, API_RATE_WINDOW_S);
  }
  return count > API_RATE_LIMIT;
};

// ---------------------------------------------------------------------------

export const config = {
  matcher: "/api/:path*",
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
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(API_RATE_WINDOW_S),
          "Access-Control-Allow-Origin": url.origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }

  // Allow the request to proceed to the rewrite destination
  return;
}