import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

const store = {};
global.sessionStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
};
global.window = { sessionStorage: global.sessionStorage };

const {
  MAX_LOGIN_ATTEMPTS,
  RESET_COOLDOWN_SECONDS,
  getBackoffDelay,
  parseRetryAfterMs,
  persistRateLimit,
  readPersistedRateLimit,
  clearPersistedRateLimit,
} = await import("../src/utils/rateLimitUtils.js");

describe("rateLimitUtils — edge cases", () => {
  it("exports reset cooldown constant", () => {
    assert.equal(RESET_COOLDOWN_SECONDS, 60);
  });

  it("returns zero backoff before the lockout threshold", () => {
    assert.equal(getBackoffDelay(MAX_LOGIN_ATTEMPTS - 1), 0);
  });

  it("persists and clears sessionStorage state", () => {
    persistRateLimit(2, 0);
    assert.deepEqual(readPersistedRateLimit(), { attempts: 2, lockoutUntil: 0 });
    clearPersistedRateLimit();
    assert.deepEqual(readPersistedRateLimit(), { attempts: 0, lockoutUntil: 0 });
  });

  it("parses integer Retry-After values", () => {
    assert.equal(parseRetryAfterMs("15"), 15000);
  });
});

console.log("rateLimitUtils edge-case tests passed ✓");
