/**
 * Client-Side Rate Limit Warning Banner Handler (#14076)
 */

const ROUTE_RULES = {
  login: { maxRequests: 5, windowMs: 60000 },
  search: { maxRequests: 60, windowMs: 60000 },
};

const clientRequestLogs = new Map();

export function isClientRequestAllowed(routeKey = "search") {
  const rule = ROUTE_RULES[routeKey] || ROUTE_RULES.search;
  const now = Date.now();
  const windowStart = now - rule.windowMs;

  if (!clientRequestLogs.has(routeKey)) {
    clientRequestLogs.set(routeKey, []);
  }

  const timestamps = clientRequestLogs.get(routeKey);
  
  // Filter older records
  const activeTimestamps = timestamps.filter((t) => t > windowStart);
  clientRequestLogs.set(routeKey, activeTimestamps);

  if (activeTimestamps.length < rule.maxRequests) {
    activeTimestamps.push(now);
    return {
      allowed: true,
      remaining: rule.maxRequests - activeTimestamps.length,
      retryAfterSeconds: 0,
    };
  }

  const oldestTimestamp = activeTimestamps[0];
  const retryAfterSeconds = Math.max(1, Math.round((oldestTimestamp + rule.windowMs - now) / 1000));

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds,
  };
}

export function clearClientRequestLogs() {
  clientRequestLogs.clear();
}
