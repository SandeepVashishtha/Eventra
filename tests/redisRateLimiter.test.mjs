import assert from "node:assert/strict";

const { checkRateLimit } = await import("../api/lib/redisRateLimiter.js");

console.log("Running Redis/Fallback Rate Limiter unit tests...");

// 1. Test in-memory fallback per-user rate limiting
const userKey = `ratelimit:test:user:${Date.now()}`;
let allowedCount = 0;
let blockedCount = 0;

for (let i = 0; i < 12; i++) {
  const result = await checkRateLimit(userKey, 60000, 10);
  if (result.allowed) {
    allowedCount++;
    assert.equal(result.remaining, 10 - allowedCount);
  } else {
    blockedCount++;
    assert.equal(result.remaining, 0);
    assert.ok(result.retryAfter > 0);
  }
}

assert.equal(allowedCount, 10, "Should allow exactly 10 requests");
assert.equal(blockedCount, 2, "Should block 2 requests after limit reached");
console.log("✓ Fallback per-user rate limiting passed");

// 2. Test global rate limiting
const globalKey = `ratelimit:test:global:${Date.now()}`;
let globalAllowed = 0;
let globalBlocked = 0;

for (let i = 0; i < 15; i++) {
  const result = await checkRateLimit(globalKey, 60000, 10);
  if (result.allowed) {
    globalAllowed++;
  } else {
    globalBlocked++;
  }
}

assert.equal(globalAllowed, 10, "Should allow exactly 10 requests globally");
assert.equal(globalBlocked, 5, "Should block 5 requests globally after limit reached");
console.log("✓ Fallback global rate limiting passed");

// 3. Test high quota warnings
const warnKey = `ratelimit:test:warn:${Date.now()}`;
let warningLogged = false;

// Mock console.warn to check for high quota alerts
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes("[QUOTA_ALERT]")) {
    warningLogged = true;
  }
  originalWarn(...args);
};

try {
  // Send 8 requests (80% usage on a limit of 10)
  for (let i = 0; i < 8; i++) {
    await checkRateLimit(warnKey, 60000, 10);
  }
  assert.ok(warningLogged, "A warning alert should have been logged for 80% usage");
  console.log("✓ High quota usage warnings passed");
} finally {
  console.warn = originalWarn;
}

console.log("All Redis/Fallback Rate Limiter unit tests passed successfully! ✓");
