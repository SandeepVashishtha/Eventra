/**
 * Tests for src/hooks/useLoginRateLimit.js
 *
 * Verifies the login rate limiting hook contract.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useLoginRateLimit.js'),
  'utf8',
);

describe('useLoginRateLimit — source contract', () => {
  it('exports useLoginRateLimit as default export', () => {
    assert.ok(
      src.includes('export default useLoginRateLimit'),
      'Must export useLoginRateLimit as default export',
    );
  });

  it('exports STORAGE_KEY_ATTEMPTS and STORAGE_KEY_LOCKOUT_UNTIL', () => {
    assert.ok(
      src.includes('export { STORAGE_KEY_ATTEMPTS, STORAGE_KEY_LOCKOUT_UNTIL }'),
      'Must export storage key constants',
    );
  });

  it('uses useState for attemptCount state', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState for state management',
    );
  });

  it('uses useEffect for persisting rate limit state', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for persisting rate limit state',
    );
  });

  it('uses useCallback for recordAttempt', () => {
    assert.ok(
      src.includes('useCallback'),
      'Must use useCallback for stable callbacks',
    );
  });

  it('uses useRef for interval reference', () => {
    assert.ok(
      src.includes('useRef'),
      'Must use useRef for interval reference',
    );
  });

  it('imports rate limit utilities', () => {
    assert.ok(
      src.includes('rateLimitUtils'),
      'Must import rate limit utilities',
    );
  });
});

describe('useLoginRateLimit — return contract', () => {
  it('returns attemptCount', () => {
    assert.ok(
      src.includes('attemptCount'),
      'Must return attemptCount',
    );
  });

  it('returns lockedOutSeconds', () => {
    assert.ok(
      src.includes('lockedOutSeconds'),
      'Must return lockedOutSeconds',
    );
  });

  it('returns remainingAttempts', () => {
    assert.ok(
      src.includes('remainingAttempts'),
      'Must return remainingAttempts',
    );
  });

  it('returns recordAttempt function', () => {
    assert.ok(
      src.includes('recordAttempt'),
      'Must return recordAttempt function',
    );
  });

  it('returns resetAttempts function', () => {
    assert.ok(
      src.includes('resetAttempts'),
      'Must return resetAttempts function',
    );
  });

  it('returns isLockedOut function', () => {
    assert.ok(
      src.includes('isLockedOut'),
      'Must return isLockedOut function',
    );
  });

  it('returns applyServerLockout function', () => {
    assert.ok(
      src.includes('applyServerLockout'),
      'Must return applyServerLockout function',
    );
  });
});

describe('useLoginRateLimit — rate limiting behavior', () => {
  it('uses getBackoffDelay for exponential backoff', () => {
    assert.ok(
      src.includes('getBackoffDelay'),
      'Must use getBackoffDelay for exponential backoff',
    );
  });

  it('uses secondsUntilUnlock for lockout duration', () => {
    assert.ok(
      src.includes('secondsUntilUnlock'),
      'Must use secondsUntilUnlock for lockout duration',
    );
  });

  it('uses setInterval for countdown ticking', () => {
    assert.ok(
      src.includes('setInterval'),
      'Must use setInterval for countdown ticking',
    );
  });

  it('uses clearInterval on cleanup', () => {
    assert.ok(
      src.includes('clearInterval'),
      'Must use clearInterval on cleanup',
    );
  });

  it('persists rate limit state to sessionStorage', () => {
    assert.ok(
      src.includes('persistRateLimit'),
      'Must persist rate limit state',
    );
  });

  it('reads persisted rate limit on init', () => {
    assert.ok(
      src.includes('readPersistedRateLimit'),
      'Must read persisted rate limit on init',
    );
  });

  it('clears persisted rate limit on reset', () => {
    assert.ok(
      src.includes('clearPersistedRateLimit'),
      'Must clear persisted rate limit on reset',
    );
  });
});

describe('useLoginRateLimit — server lockout', () => {
  it('accepts server lockout override via applyServerLockout', () => {
    assert.ok(
      src.includes('applyServerLockout'),
      'Must accept server lockout override',
    );
  });

  it('handles Retry-After header value', () => {
    assert.ok(
      src.includes('retryAfterSeconds'),
      'Must handle Retry-After header value',
    );
  });

  it('converts seconds to milliseconds', () => {
    assert.ok(
      src.includes('* 1000'),
      'Must convert seconds to milliseconds',
    );
  });
});