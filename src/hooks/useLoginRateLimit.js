/**
 * @fileoverview useLoginRateLimit - Exponential backoff login rate limiting hook
 * @module hooks/useLoginRateLimit
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getBackoffDelay,
  secondsUntilUnlock,
  MAX_LOGIN_ATTEMPTS,
  STORAGE_KEY_ATTEMPTS,
  STORAGE_KEY_LOCKOUT_UNTIL,
  readPersistedRateLimit,
  persistRateLimit,
  clearPersistedRateLimit,
} from '../utils/rateLimitUtils';

/**
 * Tracks failed login attempts and imposes an exponential backoff lockout
 * after MAX_LOGIN_ATTEMPTS consecutive failures.
 *
 * Lockout state is persisted to sessionStorage so a page refresh does not
 * reset the counter — an attacker cannot bypass client-side throttling by
 * simply reloading the tab. State is cleared on successful login or when
 * the lockout period naturally expires.
 *
 * The hook also handles 429 Too Many Requests responses from the backend:
 * call applyServerLockout(retryAfterSeconds) to override the local backoff
 * delay with the server-authoritative wait time from the Retry-After header.
 *
 * This is a UX-layer defence only. The backend must enforce its own
 * persistent, cross-session rate limiting independently.
 *
 * @returns {{
 *   attemptCount: number,
 *   lockedOutSeconds: number,
 *   remainingAttempts: number,
 *   recordAttempt: () => void,
 *   resetAttempts: () => void,
 *   isLockedOut: () => boolean,
 *   applyServerLockout: (retryAfterSeconds: number) => void,
 * }}
 */
function useLoginRateLimit() {
  const { attempts: savedAttempts, lockoutUntil: savedLockout } = readPersistedRateLimit();

  const [attemptCount, setAttemptCount] = useState(savedAttempts);
  const [lockoutUntil, setLockoutUntil] = useState(savedLockout);
  const [lockedOutSeconds, setLockedOutSeconds] = useState(
    savedLockout > Date.now() ? secondsUntilUnlock(savedLockout) : 0,
  );
  const intervalRef = useRef(null);

  // Sync lockoutUntil changes back to sessionStorage so they survive refresh.
  useEffect(() => {
    persistRateLimit(attemptCount, lockoutUntil);
  }, [attemptCount, lockoutUntil]);

  // Tick the visible countdown every second while locked out.
  useEffect(() => {
    if (lockoutUntil <= Date.now()) {
      setLockedOutSeconds(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setLockedOutSeconds(secondsUntilUnlock(lockoutUntil));

    intervalRef.current = setInterval(() => {
      const remaining = secondsUntilUnlock(lockoutUntil);
      setLockedOutSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [lockoutUntil]);

  /**
   * Registers one failed attempt and computes the next backoff lockout.
   * Also increments the persisted counter so page refresh retains state.
   */
  const recordAttempt = useCallback(() => {
    setAttemptCount((prev) => {
      const next = prev + 1;
      const delay = getBackoffDelay(next);
      if (delay > 0) {
        const until = Date.now() + delay;
        setLockoutUntil(until);
        persistRateLimit(next, until);
      } else {
        persistRateLimit(next, 0);
      }
      return next;
    });
  }, []);

  /**
   * Applies the server-authoritative lockout duration from a 429 response.
   * Reads the Retry-After value (in seconds) and overrides the local backoff
   * if the server-specified wait is longer than what was already computed.
   *
   * @param {number} retryAfterSeconds - Value from the Retry-After header (seconds).
   */
  const applyServerLockout = useCallback((retryAfterSeconds) => {
    const retryMs = Math.max(0, Number(retryAfterSeconds) || 0) * 1000;
    if (retryMs <= 0) return;

    const serverUntil = Date.now() + retryMs;
    setLockoutUntil((prev) => Math.max(prev, serverUntil));
    // persistence is handled automatically by the sync useEffect:
    // useEffect(() => { persistRateLimit(attemptCount, lockoutUntil); }, [attemptCount, lockoutUntil]);
  }, []);

  /**
   * Clears all attempt tracking and removes the persisted state.
   * Call this on successful login.
   */
  const resetAttempts = useCallback(() => {
    setAttemptCount(0);
    setLockoutUntil(0);
    setLockedOutSeconds(0);
    clearPersistedRateLimit();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Returns true if the user is currently in a lockout period.
   */
  const isLockedOut = useCallback(() => {
    return Date.now() < lockoutUntil;
  }, [lockoutUntil]);

  return {
    attemptCount,
    lockedOutSeconds,
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - attemptCount),
    recordAttempt,
    resetAttempts,
    isLockedOut,
    applyServerLockout,
  };
}

export { STORAGE_KEY_ATTEMPTS, STORAGE_KEY_LOCKOUT_UNTIL };
export default useLoginRateLimit;
