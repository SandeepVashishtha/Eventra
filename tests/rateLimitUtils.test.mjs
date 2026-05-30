import assert from "node:assert/strict";

const store = {};
globalThis.sessionStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; }
};

import {
  readPersistedRateLimit,
  persistRateLimit,
  clearPersistedRateLimit,
  parseRetryAfterMs,
  getBackoffDelay,
  formatCountdown,
  secondsUntilUnlock,
  STORAGE_KEY_ATTEMPTS,
  STORAGE_KEY_LOCKOUT_UNTIL,
  MAX_LOGIN_ATTEMPTS,
  RESET_COOLDOWN_SECONDS
} from "../src/utils/rateLimitUtils.js";

// Test constants
assert.strictEqual(MAX_LOGIN_ATTEMPTS, 5, "MAX_LOGIN_ATTEMPTS should be 5");
assert.strictEqual(RESET_COOLDOWN_SECONDS, 60, "RESET_COOLDOWN_SECONDS should be 60");

// Test clearPersistedRateLimit
clearPersistedRateLimit();
assert.strictEqual(store[STORAGE_KEY_ATTEMPTS], undefined, "Should clear attempts key");
assert.strictEqual(store[STORAGE_KEY_LOCKOUT_UNTIL], undefined, "Should clear lockout key");

// Test readPersistedRateLimit with no stored data
delete store[STORAGE_KEY_ATTEMPTS];
delete store[STORAGE_KEY_LOCKOUT_UNTIL];
let result = readPersistedRateLimit();
assert.deepEqual(result, { attempts: 0, lockoutUntil: 0 }, "Should return defaults when nothing stored");

// Test readPersistedRateLimit with valid stored values
store[STORAGE_KEY_ATTEMPTS] = "3";
store[STORAGE_KEY_LOCKOUT_UNTIL] = String(Date.now() + 60000);
result = readPersistedRateLimit();
assert.strictEqual(result.attempts, 3, "Should read attempts from storage");

// Test readPersistedRateLimit discards expired lockouts
store[STORAGE_KEY_ATTEMPTS] = "5";
store[STORAGE_KEY_LOCKOUT_UNTIL] = String(Date.now() - 1000);
result = readPersistedRateLimit();
assert.strictEqual(result.lockoutUntil, 0, "Should discard expired lockout");

// Test readPersistedRateLimit handles corrupt data
store[STORAGE_KEY_ATTEMPTS] = "not-a-number";
store[STORAGE_KEY_LOCKOUT_UNTIL] = "also-not-a-number";
result = readPersistedRateLimit();
assert.deepEqual(result, { attempts: 0, lockoutUntil: 0 }, "Should return defaults on corrupt data");

// Test persistRateLimit
persistRateLimit(3, 1234567890);
assert.strictEqual(store[STORAGE_KEY_ATTEMPTS], "3", "Should store attempts as string");
assert.strictEqual(store[STORAGE_KEY_LOCKOUT_UNTIL], "1234567890", "Should store lockoutUntil as string");

// Test parseRetryAfterMs with integer seconds
assert.strictEqual(parseRetryAfterMs("30"), 30000, "Should convert seconds to ms");
assert.strictEqual(parseRetryAfterMs("0"), 0, "Should handle 0");
assert.strictEqual(parseRetryAfterMs("120"), 120000, "Should handle larger values");

// Test parseRetryAfterMs with HTTP date
const futureDate = new Date(Date.now() + 60000).toUTCString();
const parsedMs = parseRetryAfterMs(futureDate);
assert.ok(parsedMs > 0 && parsedMs <= 60000, "Should parse HTTP date to remaining ms");

// Test parseRetryAfterMs with invalid values
assert.strictEqual(parseRetryAfterMs(null), 0, "Should return 0 for null");
assert.strictEqual(parseRetryAfterMs(undefined), 0, "Should return 0 for undefined");
assert.strictEqual(parseRetryAfterMs(""), 0, "Should return 0 for empty string");
assert.strictEqual(parseRetryAfterMs("not-a-date"), 0, "Should return 0 for invalid string");

// Test getBackoffDelay before threshold
assert.strictEqual(getBackoffDelay(1), 0, "Attempt 1 should return 0");
assert.strictEqual(getBackoffDelay(4), 0, "Attempt 4 should return 0");

// Test getBackoffDelay at threshold - backoff starts at MAX_LOGIN_ATTEMPTS
assert.strictEqual(getBackoffDelay(5), 2000, "Attempt 5 (at threshold) should return 2s");

// Test getBackoffDelay after threshold
assert.strictEqual(getBackoffDelay(6), 4000, "Attempt 6 should return 4s");
assert.strictEqual(getBackoffDelay(7), 8000, "Attempt 7 should return 8s");
assert.strictEqual(getBackoffDelay(8), 16000, "Attempt 8 should return 16s");

// Test getBackoffDelay caps at 30 seconds
assert.strictEqual(getBackoffDelay(10), 30000, "Attempt 10 should be capped at 30s");
assert.strictEqual(getBackoffDelay(15), 30000, "Attempt 15 should be capped at 30s");

// Test formatCountdown
assert.strictEqual(formatCountdown(0), "0s", "0 should format as 0s");
assert.strictEqual(formatCountdown(-1000), "0s", "Negative should format as 0s");
assert.strictEqual(formatCountdown(500), "1s", "500ms should format as 1s");
assert.strictEqual(formatCountdown(1000), "1s", "1s should format correctly");
assert.strictEqual(formatCountdown(30000), "30s", "30s should format correctly");
assert.strictEqual(formatCountdown(65000), "1m 5s", "65s should format as 1m 5s");
assert.strictEqual(formatCountdown(90000), "1m 30s", "90s should format as 1m 30s");
assert.strictEqual(formatCountdown(120000), "2m 0s", "120s should format as 2m 0s");

// Test secondsUntilUnlock
const futureLockout = Date.now() + 30000;
assert.strictEqual(secondsUntilUnlock(futureLockout) >= 29 && secondsUntilUnlock(futureLockout) <= 30, true, "Future lockout should return positive seconds");
assert.strictEqual(secondsUntilUnlock(Date.now() - 10000), 0, "Past lockout should return 0");
assert.strictEqual(secondsUntilUnlock(0), 0, "Zero lockout should return 0");

console.log("rateLimitUtils tests passed ✓");