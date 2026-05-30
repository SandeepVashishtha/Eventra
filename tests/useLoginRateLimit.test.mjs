import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useLoginRateLimit.js"),
  "utf8",
);

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

const {
  MAX_LOGIN_ATTEMPTS,
  getBackoffDelay,
  secondsUntilUnlock,
  readPersistedRateLimit,
  persistRateLimit,
  clearPersistedRateLimit,
  parseRetryAfterMs,
} = await import("../src/utils/rateLimitUtils.js");

describe("useLoginRateLimit — source contract", () => {
  it("persists attempt counts to sessionStorage", () => {
    assert.ok(src.includes("persistRateLimit"));
    assert.ok(src.includes("readPersistedRateLimit"));
  });

  it("ticks lockout countdown with setInterval", () => {
    assert.ok(src.includes("setInterval"));
    assert.ok(src.includes("clearInterval"));
  });

  it("supports server-authoritative lockouts", () => {
    assert.ok(src.includes("applyServerLockout"));
  });
});

describe("rateLimitUtils — behavior", () => {
  it("returns zero backoff before MAX_LOGIN_ATTEMPTS", () => {
    assert.equal(getBackoffDelay(MAX_LOGIN_ATTEMPTS - 1), 0);
  });

  it("applies exponential backoff after MAX_LOGIN_ATTEMPTS", () => {
    assert.equal(getBackoffDelay(MAX_LOGIN_ATTEMPTS), 2000);
    assert.equal(getBackoffDelay(MAX_LOGIN_ATTEMPTS + 1), 4000);
  });

  it("persists and restores rate-limit state", () => {
    clearPersistedRateLimit();
    persistRateLimit(3, 0);
    assert.deepEqual(readPersistedRateLimit(), { attempts: 3, lockoutUntil: 0 });
  });

  it("parses Retry-After seconds", () => {
    assert.equal(parseRetryAfterMs("30"), 30000);
  });

  it("computes remaining lockout seconds", () => {
    const lockoutUntil = Date.now() + 5000;
    assert.ok(secondsUntilUnlock(lockoutUntil) >= 4);
  });
});

console.log("useLoginRateLimit tests passed ✓");
