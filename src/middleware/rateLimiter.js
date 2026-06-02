// Authentication rate-limiter middleware
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const requestCounts = new Map();
let lastEvictionAt = 0;

const evictStale = () => {
  const now = Date.now();
  if (now - lastEvictionAt < RATE_LIMIT_WINDOW_MS) return;
  lastEvictionAt = now;

  for (const [ip, entry] of requestCounts.entries()) {
    if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) requestCounts.delete(ip);
  }
};

export function checkRateLimit(ip) {
  const now = Date.now();
  evictStale();

  const entry = requestCounts.get(ip);
  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  entry.count += 1;
  return true;
}

