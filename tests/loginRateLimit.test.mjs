/**
 * Tests for useLoginRateLimit logic (issue #3459).
 *
 * We test the pure backoff computation and state machine logic in isolation
 * from React, without requiring jsdom or hooks infrastructure.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ── Inline the pure logic from useLoginRateLimit ──────────────────────────────

const ATTEMPT_THRESHOLD = 3;
const MAX_BACKOFF_MS = 30_000;
const HARD_LOCKOUT_ATTEMPTS = 10;
const HARD_LOCKOUT_MS = 5 * 60 * 1000;

const computeBackoff = (attempts) => {
  if (attempts <= ATTEMPT_THRESHOLD) return 0;
  return Math.min(Math.pow(2, attempts - ATTEMPT_THRESHOLD) * 1000, MAX_BACKOFF_MS);
};

// Minimal state machine mirroring hook behaviour
const createRateLimiter = () => {
  let attempts = 0;
  let lockoutUntil = 0;

  const now = () => Date.now();

  return {
    canAttempt: () => lockoutUntil <= now(),
    recordFailure: (retryAfterSeconds) => {
      attempts += 1;
      let ms;
      if (typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0) {
        ms = retryAfterSeconds * 1000;
      } else if (attempts >= HARD_LOCKOUT_ATTEMPTS) {
        ms = HARD_LOCKOUT_MS;
      } else {
        ms = computeBackoff(attempts);
      }
      if (ms > 0) {
        lockoutUntil = now() + ms;
      }
    },
    recordSuccess: () => {
      attempts = 0;
      lockoutUntil = 0;
    },
    getAttempts: () => attempts,
    getLockoutUntil: () => lockoutUntil,
  };
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useLoginRateLimit — backoff computation', () => {
  it('returns 0 delay for first ATTEMPT_THRESHOLD failures', () => {
    for (let i = 1; i <= ATTEMPT_THRESHOLD; i++) {
      expect(computeBackoff(i)).toBe(0);
    }
  });

  it('returns 1000ms for attempt 4 (first backoff step)', () => {
    expect(computeBackoff(4)).toBe(1000);
  });

  it('returns 2000ms for attempt 5', () => {
    expect(computeBackoff(5)).toBe(2000);
  });

  it('returns 4000ms for attempt 6', () => {
    expect(computeBackoff(6)).toBe(4000);
  });

  it('caps at MAX_BACKOFF_MS (30s) for high attempt counts', () => {
    expect(computeBackoff(20)).toBe(MAX_BACKOFF_MS);
    expect(computeBackoff(50)).toBe(MAX_BACKOFF_MS);
  });

  it('backoff grows exponentially between threshold and cap', () => {
    const prev = computeBackoff(5);
    const next = computeBackoff(6);
    expect(next).toBe(prev * 2);
  });
});

describe('useLoginRateLimit — state machine', () => {
  let limiter;

  beforeEach(() => {
    limiter = createRateLimiter();
  });

  it('allows attempts before any failures', () => {
    expect(limiter.canAttempt()).toBe(true);
  });

  it('does not lock after first 3 failures (below threshold)', () => {
    for (let i = 0; i < ATTEMPT_THRESHOLD; i++) {
      limiter.recordFailure();
    }
    expect(limiter.canAttempt()).toBe(true);
    expect(limiter.getLockoutUntil()).toBe(0);
  });

  it('locks after 4th failure with ~1s delay', () => {
    for (let i = 0; i < 4; i++) {
      limiter.recordFailure();
    }
    expect(limiter.canAttempt()).toBe(false);
    const remaining = limiter.getLockoutUntil() - Date.now();
    expect(remaining).toBeGreaterThan(800);
    expect(remaining).toBeLessThanOrEqual(1100);
  });

  it('applies hard lockout after HARD_LOCKOUT_ATTEMPTS failures', () => {
    for (let i = 0; i < HARD_LOCKOUT_ATTEMPTS; i++) {
      limiter.recordFailure();
    }
    const remaining = limiter.getLockoutUntil() - Date.now();
    expect(remaining).toBeGreaterThan(HARD_LOCKOUT_MS - 200);
    expect(remaining).toBeLessThanOrEqual(HARD_LOCKOUT_MS + 200);
  });

  it('recordSuccess resets attempts and clears lockout', () => {
    for (let i = 0; i < 5; i++) {
      limiter.recordFailure();
    }
    expect(limiter.canAttempt()).toBe(false);

    limiter.recordSuccess();

    expect(limiter.canAttempt()).toBe(true);
    expect(limiter.getAttempts()).toBe(0);
    expect(limiter.getLockoutUntil()).toBe(0);
  });

  it('respects retryAfterSeconds from backend 429', () => {
    limiter.recordFailure(60);
    const remaining = limiter.getLockoutUntil() - Date.now();
    expect(remaining).toBeGreaterThan(59_000);
    expect(remaining).toBeLessThanOrEqual(61_000);
  });

  it('ignores non-positive retryAfterSeconds and uses backoff instead', () => {
    for (let i = 0; i < 4; i++) {
      limiter.recordFailure(0);
    }
    // 4th failure → computeBackoff(4) = 1000ms
    const remaining = limiter.getLockoutUntil() - Date.now();
    expect(remaining).toBeGreaterThan(800);
    expect(remaining).toBeLessThanOrEqual(1100);
  });

  it('locks persist across multiple failures without reset', () => {
    for (let i = 0; i < 6; i++) {
      limiter.recordFailure();
    }
    expect(limiter.canAttempt()).toBe(false);
    expect(limiter.getAttempts()).toBe(6);
  });

  it('each recordSuccess fully resets the counter from any depth', () => {
    for (let i = 0; i < HARD_LOCKOUT_ATTEMPTS; i++) {
      limiter.recordFailure();
    }
    limiter.recordSuccess();
    expect(limiter.getAttempts()).toBe(0);
    expect(limiter.canAttempt()).toBe(true);

    // After reset, first 3 failures should not lock again
    for (let i = 0; i < ATTEMPT_THRESHOLD; i++) {
      limiter.recordFailure();
    }
    expect(limiter.canAttempt()).toBe(true);
  });
});
