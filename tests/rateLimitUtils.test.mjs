import assert from "node:assert/strict";
import {
  readPersistedRateLimit,
  persistRateLimit,
  clearPersistedRateLimit,
  parseRetryAfterMs,
  getBackoffDelay,
  formatCountdown,
  secondsUntilUnlock,
  MAX_LOGIN_ATTEMPTS,
  STORAGE_KEY_ATTEMPTS,
  STORAGE_KEY_LOCKOUT_UNTIL,
} from "../src/utils/rateLimitUtils.js";

// Always install an isolated in-memory mock regardless of Node built-ins.
// Node 26 exposes a native sessionStorage that lacks the ._data property
// used by the assertions below, so we unconditionally replace it.
const _data = {};
globalThis.sessionStorage = {
  _data,
  getItem: function(key) { return _data[key] ?? null; },
  setItem: function(key, val) { _data[key] = String(val); },
  removeItem: function(key) { delete _data[key]; },
  clear: function() { Object.keys(_data).forEach(k => delete _data[k]); },
};

const storage = _data;

assert.equal(readPersistedRateLimit().attempts, 0, "empty storage should return 0 attempts");
assert.equal(readPersistedRateLimit().lockoutUntil, 0, "empty storage should return 0 lockoutUntil");

persistRateLimit(3, 0);
assert.deepEqual(readPersistedRateLimit(), { attempts: 3, lockoutUntil: 0 }, "persist and read 3 attempts");

persistRateLimit(0, Date.now() + 60000);
const result = readPersistedRateLimit();
assert.ok(result.attempts === 0, "attempts should be 0");
assert.ok(result.lockoutUntil > Date.now(), "lockout should be in future");

clearPersistedRateLimit();
assert.deepEqual(readPersistedRateLimit(), { attempts: 0, lockoutUntil: 0 }, "after clear");

storage[STORAGE_KEY_ATTEMPTS] = "NaN";
storage[STORAGE_KEY_LOCKOUT_UNTIL] = "0";
assert.deepEqual(readPersistedRateLimit(), { attempts: 0, lockoutUntil: 0 }, "NaN attempts returns 0");

storage[STORAGE_KEY_ATTEMPTS] = "-5";
storage[STORAGE_KEY_LOCKOUT_UNTIL] = "0";
assert.deepEqual(readPersistedRateLimit(), { attempts: 0, lockoutUntil: 0 }, "negative attempts returns 0");

storage[STORAGE_KEY_ATTEMPTS] = "99999999999";
storage[STORAGE_KEY_LOCKOUT_UNTIL] = "0";
assert.deepEqual(readPersistedRateLimit(), { attempts: 99999999999, lockoutUntil: 0 }, "very large but finite attempts is accepted");

assert.equal(parseRetryAfterMs(null), 0, "null returns 0");
assert.equal(parseRetryAfterMs(undefined), 0, "undefined returns 0");
assert.equal(parseRetryAfterMs(""), 0, "empty string returns 0");
assert.equal(parseRetryAfterMs("abc"), 0, "non-numeric string returns 0");
assert.equal(parseRetryAfterMs("30"), 30000, "integer seconds form returns correct ms");
assert.equal(parseRetryAfterMs("0"), 0, "zero seconds returns 0");
assert.equal(parseRetryAfterMs("  45  "), 45000, "whitespace-padded seconds");
assert.equal(parseRetryAfterMs("not123"), 0, "mixed text returns 0");
assert.equal(parseRetryAfterMs("123.45"), 0, "decimal returns 0");
assert.equal(parseRetryAfterMs("72 hours"), 0, "text with number returns 0");

const futureDate = new Date(Date.now() + 30000).toUTCString();
const resultMs = parseRetryAfterMs(futureDate);
assert.ok(resultMs > 0 && resultMs <= 30000, "HTTP-date form returns positive ms");

assert.equal(parseRetryAfterMs("Tue, 01 Jan 2000 00:00:00 GMT"), 0, "past date returns 0");

assert.equal(getBackoffDelay(0), 0, "0 attempts returns 0");
assert.equal(getBackoffDelay(1), 0, "1 attempt returns 0");
assert.equal(getBackoffDelay(4), 0, "4 attempts (below MAX_LOGIN_ATTEMPTS) returns 0");
assert.equal(getBackoffDelay(5), 2000, "5 attempts (at threshold) returns 2s");
assert.equal(getBackoffDelay(6), 4000, "6 attempts returns 4s");
assert.equal(getBackoffDelay(7), 8000, "7 attempts returns 8s");
assert.equal(getBackoffDelay(8), 16000, "8 attempts returns 16s");
assert.equal(getBackoffDelay(9), 30000, "9 attempts (exceeds cap) returns 30s");
assert.equal(getBackoffDelay(100), 30000, "100 attempts returns 30s (capped)");

assert.equal(formatCountdown(0), "0s", "zero returns 0s");
assert.equal(formatCountdown(-100), "0s", "negative returns 0s");
assert.equal(formatCountdown(999), "1s", "999ms rounds up to 1s");
assert.equal(formatCountdown(1000), "1s", "1 second returns 1s");
assert.equal(formatCountdown(59000), "59s", "59 seconds returns 59s");
assert.equal(formatCountdown(60000), "1m 0s", "60 seconds returns 1m 0s");
assert.equal(formatCountdown(65000), "1m 5s", "65 seconds returns 1m 5s");
assert.equal(formatCountdown(120000), "2m 0s", "120 seconds returns 2m 0s");
assert.equal(formatCountdown(90000), "1m 30s", "90 seconds returns 1m 30s");

const futureUnlock = Date.now() + 45000;
const pastUnlock = Date.now() - 1000;
assert.ok(secondsUntilUnlock(futureUnlock) > 0, "future lockout returns positive");
assert.equal(secondsUntilUnlock(pastUnlock), 0, "past lockout returns 0");
assert.equal(secondsUntilUnlock(0), 0, "zero lockout returns 0");

console.log("All rateLimitUtils tests passed!");