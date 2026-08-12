import assert from "node:assert/strict";

// #14560: the Login and Password Reset pages import login-lockout symbols from
// `utils/rateLimitUtils` (Vite alias -> src/utils/rateLimitUtils.js). That
// module used to only export calculateJitteredBackoff and isRateLimitError, so
// the named imports failed to resolve and the pages crashed at module load.
// The symbols live in src/components/utils/rateLimitUtils.js and must be
// re-exported here so the existing imports resolve.

const mod = await import("../src/utils/rateLimitUtils.js");

const required = [
  "MAX_LOGIN_ATTEMPTS",
  "parseRetryAfterMs",
  "RESET_COOLDOWN_SECONDS",
  "secondsUntilUnlock",
  "STORAGE_KEY_RESET_LAST_SUBMIT",
  // pre-existing exports must still be present
  "calculateJitteredBackoff",
  "isRateLimitError",
];

const missing = required.filter((name) => !(name in mod));
assert.deepEqual(
  missing,
  [],
  `utils/rateLimitUtils is missing: ${missing.join(", ")}`,
);

// Spot-check that the re-exported values are real, not undefined.
assert.equal(typeof mod.MAX_LOGIN_ATTEMPTS, "number");
assert.equal(typeof mod.RESET_COOLDOWN_SECONDS, "number");
assert.equal(typeof mod.parseRetryAfterMs, "function");
assert.equal(typeof mod.secondsUntilUnlock, "function");
assert.equal(typeof mod.STORAGE_KEY_RESET_LAST_SUBMIT, "string");

// Original exports still work as before.
assert.equal(typeof mod.calculateJitteredBackoff, "function");
assert.equal(typeof mod.isRateLimitError, "function");
assert.equal(mod.isRateLimitError({ status: 429 }), true);
assert.equal(mod.isRateLimitError({ status: 500 }), false);

// Mirror the exact import shape used by the auth pages.
const {
  MAX_LOGIN_ATTEMPTS,
  parseRetryAfterMs,
  RESET_COOLDOWN_SECONDS,
  secondsUntilUnlock,
  STORAGE_KEY_RESET_LAST_SUBMIT,
} = mod;
assert.ok(MAX_LOGIN_ATTEMPTS > 0, "MAX_LOGIN_ATTEMPTS is a positive number");
assert.ok(
  RESET_COOLDOWN_SECONDS > 0,
  "RESET_COOLDOWN_SECONDS is a positive number",
);
assert.ok(STORAGE_KEY_RESET_LAST_SUBMIT.length > 0, "reset storage key set");

console.log("rateLimitUtils login-lockout re-export tests passed");
