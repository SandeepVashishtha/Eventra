import { verifyAuth } from "./middleware/auth.js";

const SAFE_GITHUB_PATH_PATTERNS = [
  /^\/repos\/[^/?#]+\/[^/?#]+$/,
  /^\/repos\/[^/?#]+\/[^/?#]+\/contributors$/,
  /^\/repos\/[^/?#]+\/[^/?#]+\/pulls$/,
  /^\/users\/[^/?#]+$/,
];

// Only these query parameters are forwarded to the GitHub API.
// All other caller-supplied parameters are silently dropped.
const ALLOWED_QUERY_PARAMS = new Set(["per_page", "page", "state", "sort", "direction"]);

// ---------------------------------------------------------------------------
// Per-user rate limiter
//
// Tracks request counts in a module-level Map so the limit is shared across
// all requests handled by the same warm function instance.
//
// Each entry: { count: number, windowStart: number (epoch ms) }
// Window: 60 seconds | Limit: 60 requests per user per window
//
// Note: in-memory state does not persist across cold starts. This is
// intentional for a stateless Vercel deployment: the limit prevents a single
// user from exhausting the quota within one warm instance's lifetime. For
// stronger guarantees, replace with a Redis-backed counter.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;  // requests per window per user

const rateLimitMap = new Map();

const isRateLimited = (userId) => {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
};

// Evict stale entries to prevent unbounded memory growth in long-lived
// instances. Called after every rate-limit check.
const evictStaleEntries = () => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
};

const normalizePath = (path) => {
  const rawPath = Array.isArray(path) ? path.join("/") : path;
  if (!rawPath || typeof rawPath !== "string") {
    return "";
  }

  return rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
};

const isSafeGitHubPath = (path) => {
  if (path.includes("..") || path.includes("@") || path.includes("://")) {
    return false;
  }

  const { pathname } = new URL(path, "https://api.github.com");
  return SAFE_GITHUB_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
};

async function handler(req, res) {
  // req.user is populated by the verifyAuth wrapper.
  const userId = req.user?.id || req.user?.email;

  // Check rate limit before doing any work.
  if (isRateLimited(userId)) {
    evictStaleEntries();
    return res.status(429).json({
      error: "Too many requests. You may make up to 60 proxy requests per minute.",
    });
  }
  evictStaleEntries();

  const { path, ...queryParams } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  const normalizedPath = normalizePath(path);

  if (!normalizedPath || !isSafeGitHubPath(normalizedPath)) {
    return res.status(400).json({ error: "Invalid GitHub API path" });
  }

  const url = new URL(normalizedPath, "https://api.github.com");
  Object.entries(queryParams).forEach(([key, value]) => {
    if (!ALLOWED_QUERY_PARAMS.has(key)) return;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
    } else if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  });

  const token = process.env.GITHUB_TOKEN;

  try {
    const fetchRes = await fetch(url.toString(), {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(token ? { Authorization: `token ${token}` } : {}),
      },
    });

    const data = await fetchRes.json();

    // Forward GitHub's cache headers where present so CDN and browser
    // caches can absorb repeat reads of the same resource.
    const cacheControl = fetchRes.headers.get("cache-control");
    if (cacheControl) {
      res.setHeader("Cache-Control", cacheControl);
    }

    return res.status(fetchRes.status).json(data);
  } catch (error) {
    console.error("GitHub Proxy Error:", error);
    return res.status(500).json({ error: "Failed to fetch from GitHub API" });
  }
}

export default verifyAuth(handler);
