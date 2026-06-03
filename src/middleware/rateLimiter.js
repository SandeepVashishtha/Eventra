// Authentication rate-limiter middleware
// WARNING: Client-side rate limiting provides zero security value.
// Any user can bypass this by refreshing, using DevTools, or a new tab.
// Rate limiting MUST be enforced on the server. This module is a no-op
// placeholder until server-side enforcement is implemented.

let warned = false;

export function checkRateLimit(_ip) {
  if (!warned) {
    console.warn(
      "[rateLimiter] Client-side rate limiter is a no-op. " +
      "Implement server-side rate limiting for real protection."
    );
    warned = true;
  }
  return true;
}

