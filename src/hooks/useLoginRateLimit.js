import { useState, useRef, useCallback, useEffect } from 'react';

const ATTEMPT_THRESHOLD = 3;
const MAX_BACKOFF_MS = 30_000;
const HARD_LOCKOUT_ATTEMPTS = 10;
const HARD_LOCKOUT_MS = 5 * 60 * 1000;
const SESSION_KEY = 'eventra:login_lockout';

/**
 * Reads persisted lockout state from sessionStorage.
 * Returns null if there is no active lockout.
 *
 * @returns {{ until: number, attempts: number } | null}
 */
const readPersistedLockout = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.until !== 'number' || parsed.until <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Persists lockout state to sessionStorage so it survives soft page refreshes.
 *
 * @param {number} until - Timestamp (ms) when the lockout expires
 * @param {number} attempts - Current failure count
 */
const persistLockout = (until, attempts) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ until, attempts }));
  } catch {
    // sessionStorage may be unavailable in private browsing
  }
};

const clearPersistedLockout = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
};

/**
 * Computes the exponential backoff delay for a given failure count.
 *
 * Delay starts at 0 for the first ATTEMPT_THRESHOLD failures, then grows:
 *   attempt 4 →    1 s
 *   attempt 5 →    2 s
 *   attempt 6 →    4 s
 *   attempt 7 →    8 s
 *   attempt 8 →   16 s
 *   attempt 9+  →  30 s (capped)
 *
 * @param {number} attempts - Total failed attempts so far
 * @returns {number} Delay in milliseconds
 */
const computeBackoff = (attempts) => {
  if (attempts <= ATTEMPT_THRESHOLD) return 0;
  return Math.min(Math.pow(2, attempts - ATTEMPT_THRESHOLD) * 1000, MAX_BACKOFF_MS);
};

/**
 * Client-side login rate limiter with exponential backoff and hard lockout.
 *
 * Tracks failed login attempts in a useRef so state updates during countdown
 * do not cause the hook to re-initialize. Countdown seconds are exposed as
 * state so the UI can re-render on each tick.
 *
 * The hard lockout (after HARD_LOCKOUT_ATTEMPTS failures) is stored in
 * sessionStorage so it survives a page refresh without requiring the user
 * to re-attempt the full failure sequence.
 *
 * @returns {{
 *   isLocked: boolean,
 *   secondsRemaining: number,
 *   canAttempt: () => boolean,
 *   recordFailure: (retryAfterSeconds?: number) => void,
 *   recordSuccess: () => void,
 *   failedAttempts: number,
 * }}
 */
const useLoginRateLimit = () => {
  const attemptsRef = useRef(0);
  const lockoutUntilRef = useRef(0);
  const countdownRef = useRef(null);

  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    const persisted = readPersistedLockout();
    if (persisted) {
      attemptsRef.current = persisted.attempts;
      lockoutUntilRef.current = persisted.until;
      return Math.ceil((persisted.until - Date.now()) / 1000);
    }
    return 0;
  });

  const isLocked = secondsRemaining > 0;

  const startCountdown = useCallback((durationMs) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    const endTime = Date.now() + durationMs;
    lockoutUntilRef.current = endTime;

    setSecondsRemaining(Math.ceil(durationMs / 1000));

    countdownRef.current = setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        lockoutUntilRef.current = 0;
        setSecondsRemaining(0);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const canAttempt = useCallback(() => {
    return lockoutUntilRef.current <= Date.now();
  }, []);

  const recordFailure = useCallback((retryAfterSeconds) => {
    attemptsRef.current += 1;
    const attempts = attemptsRef.current;

    let lockoutMs;

    if (typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0) {
      // Backend sent a Retry-After header — synchronise client lockout with server
      lockoutMs = retryAfterSeconds * 1000;
    } else if (attempts >= HARD_LOCKOUT_ATTEMPTS) {
      lockoutMs = HARD_LOCKOUT_MS;
    } else {
      lockoutMs = computeBackoff(attempts);
    }

    if (lockoutMs > 0) {
      persistLockout(Date.now() + lockoutMs, attempts);
      startCountdown(lockoutMs);
    }
  }, [startCountdown]);

  const recordSuccess = useCallback(() => {
    attemptsRef.current = 0;
    lockoutUntilRef.current = 0;
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setSecondsRemaining(0);
    clearPersistedLockout();
  }, []);

  return {
    isLocked,
    secondsRemaining,
    canAttempt,
    recordFailure,
    recordSuccess,
    failedAttempts: attemptsRef.current,
  };
};

export default useLoginRateLimit;
