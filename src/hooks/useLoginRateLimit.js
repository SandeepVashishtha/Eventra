import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getBackoffDelay,
  secondsUntilUnlock,
  MAX_LOGIN_ATTEMPTS,
} from '../utils/rateLimitUtils';

/**
 * Tracks failed login attempts and imposes an exponential backoff lockout
 * after MAX_LOGIN_ATTEMPTS consecutive failures.
 *
 * The lockout state is intentionally kept in component memory only — it resets
 * on page refresh. This is by design: the frontend layer is a first-line UX
 * defence that raises the cost of interactive attacks. The backend is
 * responsible for persistent, cross-session rate limiting.
 *
 * @returns {{
 *   attemptCount: number,
 *   lockedOutSeconds: number,
 *   recordAttempt: () => void,
 *   resetAttempts: () => void,
 *   isLockedOut: () => boolean,
 * }}
 */
function useLoginRateLimit() {
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [lockedOutSeconds, setLockedOutSeconds] = useState(0);
  const intervalRef = useRef(null);

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
   * Registers one failed attempt. If the total reaches MAX_LOGIN_ATTEMPTS,
   * a lockout period is set according to the exponential backoff schedule.
   */
  const recordAttempt = useCallback(() => {
    setAttemptCount((prev) => {
      const next = prev + 1;
      const delay = getBackoffDelay(next);
      if (delay > 0) {
        setLockoutUntil(Date.now() + delay);
      }
      return next;
    });
  }, []);

  /**
   * Clears all attempt tracking — call this on successful login.
   */
  const resetAttempts = useCallback(() => {
    setAttemptCount(0);
    setLockoutUntil(0);
    setLockedOutSeconds(0);
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
  };
}

export default useLoginRateLimit;

export const getLoginAttemptMax = () => {
  return MAX_LOGIN_ATTEMPTS;
};
