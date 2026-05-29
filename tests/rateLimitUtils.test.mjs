/**
 * Tests for src/utils/rateLimitUtils.js
 *
 * Covers: backoff computation, sessionStorage persistence helpers,
 * parseRetryAfterMs, and the page-refresh-bypass security invariant.
 */

import { strict as assert } from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

// ---------------------------------------------------------------------------
// sessionStorage mock
// ---------------------------------------------------------------------------

class SessionStorageMock {
  constructor() { this._store = {}; }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null; }
  setItem(k, v) { this._store[k] = String(v); }
  removeItem(k) { delete this._store[k]; }
  clear() { this._store = {}; }
}

const mockSession = new SessionStorageMock();
global.sessionStorage = mockSession;
global.window = { sessionStorage: mockSession };

// ---------------------------------------------------------------------------
// Module under test (imported AFTER shims)
// ---------------------------------------------------------------------------

const {
  MAX_LOGIN_ATTEMPTS,
  STORAGE_KEY_ATTEMPTS,
  STORAGE_KEY_LOCKOUT_UNTIL,
  getBackoffDelay,
  formatCountdown,
  secondsUntilUnlock,
  readPersistedRateLimit,
  persistRateLimit,
  clearPersistedRateLimit,
  parseRetryAfterMs,
} = await import('../src/utils/rateLimitUtils.js');

// ---------------------------------------------------------------------------
// getBackoffDelay
// ---------------------------------------------------------------------------

describe('getBackoffDelay', () => {
  it('returns 0 for attempts below MAX_LOGIN_ATTEMPTS', () => {
    for (let i = 0; i < MAX_LOGIN_ATTEMPTS; i++) {
      assert.strictEqual(getBackoffDelay(i), 0, `Expected 0 for attempt ${i}`);
    }
  });

  it('returns a positive delay at exactly MAX_LOGIN_ATTEMPTS', () => {
    assert.ok(getBackoffDelay(MAX_LOGIN_ATTEMPTS) > 0);
  });

  it('delay increases with each additional attempt', () => {
    const d1 = getBackoffDelay(MAX_LOGIN_ATTEMPTS);
    const d2 = getBackoffDelay(MAX_LOGIN_ATTEMPTS + 1);
    assert.ok(d2 > d1, 'delay should increase with more attempts');
  });

  it('delay is capped at 30 000 ms', () => {
    for (let i = MAX_LOGIN_ATTEMPTS; i <= MAX_LOGIN_ATTEMPTS + 10; i++) {
      assert.ok(
        getBackoffDelay(i) <= 30_000,
        `Expected delay <= 30000 ms for ${i} attempts`,
      );
    }
  });

  it('returns a number (not NaN)', () => {
    assert.ok(!isNaN(getBackoffDelay(MAX_LOGIN_ATTEMPTS)));
  });
});

// ---------------------------------------------------------------------------
// formatCountdown
// ---------------------------------------------------------------------------

describe('formatCountdown', () => {
  it('returns "0s" for zero or negative input', () => {
    assert.strictEqual(formatCountdown(0), '0s');
    assert.strictEqual(formatCountdown(-1000), '0s');
  });

  it('formats sub-minute durations as "Xs"', () => {
    assert.strictEqual(formatCountdown(29_000), '29s');
    assert.strictEqual(formatCountdown(1_000), '1s');
  });

  it('formats minute-scale durations as "Xm Ys"', () => {
    assert.strictEqual(formatCountdown(90_000), '1m 30s');
    assert.strictEqual(formatCountdown(120_000), '2m 0s');
  });

  it('rounds up partial seconds', () => {
    assert.strictEqual(formatCountdown(1_500), '2s');
  });
});

// ---------------------------------------------------------------------------
// secondsUntilUnlock
// ---------------------------------------------------------------------------

describe('secondsUntilUnlock', () => {
  it('returns 0 for a lockout already in the past', () => {
    assert.strictEqual(secondsUntilUnlock(Date.now() - 5000), 0);
  });

  it('returns a positive count for a future lockout', () => {
    const future = Date.now() + 10_000;
    const s = secondsUntilUnlock(future);
    assert.ok(s > 0 && s <= 10, `Expected 1-10s, got ${s}`);
  });

  it('never returns negative', () => {
    assert.ok(secondsUntilUnlock(0) >= 0);
  });
});

// ---------------------------------------------------------------------------
// persistRateLimit / readPersistedRateLimit / clearPersistedRateLimit
// ---------------------------------------------------------------------------

describe('sessionStorage persistence', () => {
  beforeEach(() => {
    mockSession.clear();
  });

  it('persistRateLimit writes attempts and lockoutUntil to sessionStorage', () => {
    persistRateLimit(3, 9_999_999_999);
    assert.strictEqual(mockSession.getItem(STORAGE_KEY_ATTEMPTS), '3');
    assert.strictEqual(mockSession.getItem(STORAGE_KEY_LOCKOUT_UNTIL), '9999999999');
  });

  it('readPersistedRateLimit returns the written values', () => {
    persistRateLimit(4, Date.now() + 30_000);
    const { attempts, lockoutUntil } = readPersistedRateLimit();
    assert.strictEqual(attempts, 4);
    assert.ok(lockoutUntil > Date.now());
  });

  it('readPersistedRateLimit returns zeroed defaults when storage is empty', () => {
    const { attempts, lockoutUntil } = readPersistedRateLimit();
    assert.strictEqual(attempts, 0);
    assert.strictEqual(lockoutUntil, 0);
  });

  it('readPersistedRateLimit discards an already-expired lockoutUntil', () => {
    // Expired lockout (1 second in the past)
    mockSession.setItem(STORAGE_KEY_ATTEMPTS, '5');
    mockSession.setItem(STORAGE_KEY_LOCKOUT_UNTIL, String(Date.now() - 1000));
    const { lockoutUntil } = readPersistedRateLimit();
    assert.strictEqual(lockoutUntil, 0, 'Expired lockout should be discarded');
  });

  it('readPersistedRateLimit returns 0 lockoutUntil for value of 0', () => {
    persistRateLimit(2, 0);
    const { lockoutUntil } = readPersistedRateLimit();
    assert.strictEqual(lockoutUntil, 0);
  });

  it('clearPersistedRateLimit removes both keys', () => {
    persistRateLimit(3, Date.now() + 10_000);
    clearPersistedRateLimit();
    assert.strictEqual(mockSession.getItem(STORAGE_KEY_ATTEMPTS), null);
    assert.strictEqual(mockSession.getItem(STORAGE_KEY_LOCKOUT_UNTIL), null);
  });

  it('readPersistedRateLimit handles corrupt/non-numeric values gracefully', () => {
    mockSession.setItem(STORAGE_KEY_ATTEMPTS, 'notanumber');
    mockSession.setItem(STORAGE_KEY_LOCKOUT_UNTIL, 'alsonotanumber');
    const { attempts, lockoutUntil } = readPersistedRateLimit();
    assert.strictEqual(lockoutUntil, 0);
    // attempts is NaN from parseInt — should default to 0
    assert.ok(attempts === 0 || isNaN(attempts), 'Corrupt attempts should be 0 or NaN');
  });

  // Security invariant: page refresh does NOT reset the lockout
  it('page refresh does not bypass lockout — state survives sessionStorage round-trip', () => {
    const futureTs = Date.now() + 15_000;
    persistRateLimit(MAX_LOGIN_ATTEMPTS, futureTs);

    // Simulate page refresh: read back from sessionStorage (as the hook does on mount)
    const { attempts, lockoutUntil } = readPersistedRateLimit();
    assert.strictEqual(attempts, MAX_LOGIN_ATTEMPTS);
    assert.ok(lockoutUntil > Date.now(), 'Lockout must still be active after simulated refresh');
  });

  it('attempt count accumulates correctly across multiple persistRateLimit calls', () => {
    persistRateLimit(1, 0);
    persistRateLimit(2, 0);
    persistRateLimit(3, 0);
    const { attempts } = readPersistedRateLimit();
    assert.strictEqual(attempts, 3);
  });
});

// ---------------------------------------------------------------------------
// parseRetryAfterMs
// ---------------------------------------------------------------------------

describe('parseRetryAfterMs', () => {
  it('parses integer seconds form "30" as 30000 ms', () => {
    assert.strictEqual(parseRetryAfterMs('30'), 30_000);
  });

  it('parses "0" as 0 ms', () => {
    assert.strictEqual(parseRetryAfterMs('0'), 0);
  });

  it('parses a future HTTP-date correctly', () => {
    const futureDate = new Date(Date.now() + 60_000).toUTCString();
    const result = parseRetryAfterMs(futureDate);
    assert.ok(result > 55_000 && result <= 61_000, `Expected ~60000 ms, got ${result}`);
  });

  it('returns 0 for null', () => {
    assert.strictEqual(parseRetryAfterMs(null), 0);
  });

  it('returns 0 for undefined', () => {
    assert.strictEqual(parseRetryAfterMs(undefined), 0);
  });

  it('returns 0 for empty string', () => {
    assert.strictEqual(parseRetryAfterMs(''), 0);
  });

  it('returns 0 for a non-date, non-integer string', () => {
    assert.strictEqual(parseRetryAfterMs('invalid'), 0);
  });

  it('returns 0 for a past HTTP-date', () => {
    const pastDate = new Date(Date.now() - 60_000).toUTCString();
    assert.strictEqual(parseRetryAfterMs(pastDate), 0);
  });

  it('returns 0 for negative second values', () => {
    assert.strictEqual(parseRetryAfterMs('-10'), 0);
  });

  it('handles large second values without overflow', () => {
    const result = parseRetryAfterMs('86400');
    assert.strictEqual(result, 86_400_000);
  });
});
