// ---------------------------------------------------------------------------
// Vercel Edge Middleware — runs on every request before the destination
// handler (rewrite, serverless function, or static file).
//
// The /api/:path* rewrite sends all API traffic directly to the external
// Azure backend, bypassing the serverless auth & rate-limit functions in
// /api/*.js. This middleware restores edge-level abuse protection for
// those proxied requests.
// ---------------------------------------------------------------------------

const API_RATE_LIMIT = 60;        // max requests
const API_RATE_WINDOW_MS = 60_000; // per window

const ipRateMap = new Map();
let lastEvictionAt = 0;

const evictStale = () => {
  const now = Date.now();
  if (now - lastEvictionAt < API_RATE_WINDOW_MS) return;
  lastEvictionAt = now;
  const cutoff = now - API_RATE_WINDOW_MS;
  for (const [ip, entries] of ipRateMap) {
    const valid = entries.filter((t) => t > cutoff);
    if (valid.length === 0) ipRateMap.delete(ip);
    else ipRateMap.set(ip, valid);
  }
};

const isRateLimited = (ip) => {
  evictStale();
  const now = Date.now();
  const cutoff = now - API_RATE_WINDOW_MS;
  const timestamps = ipRateMap.get(ip) || [];
  const valid = timestamps.filter((t) => t > cutoff);

  if (valid.length >= API_RATE_LIMIT) return true;

  valid.push(now);
  ipRateMap.set(ip, valid);
  return false;
};

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

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
          "Access-Control-Allow-Origin": url.origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }

  // Allow the request to proceed to the rewrite destination
  return;
}
