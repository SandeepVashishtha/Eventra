/**
 * authRateLimiter.js
 * Client-side rate limiting for authentication attempts.
 * Prevents brute-force attacks by tracking and limiting login attempts.
 */

const STORAGE_KEY = "eventra_auth_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const getAttempts = (identifier) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return stored[identifier] || { count: 0, firstAttempt: null, lockedUntil: null };
  } catch {
    return { count: 0, firstAttempt: null, lockedUntil: null };
  }
};

const saveAttempts = (identifier, attempts) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    stored[identifier] = attempts;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {}
};

export const isRateLimited = (identifier) => {
  const attempts = getAttempts(identifier);
  if (!attempts.lockedUntil) return false;
  if (Date.now() < attempts.lockedUntil) return true;
  clearAttempts(identifier);
  return false;
};

export const getRemainingLockoutTime = (identifier) => {
  const attempts = getAttempts(identifier);
  if (!attempts.lockedUntil) return 0;
  const remaining = attempts.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

export const recordFailedAttempt = (identifier) => {
  const attempts = getAttempts(identifier);
  const now = Date.now();

  const updated = {
    count: attempts.count + 1,
    firstAttempt: attempts.firstAttempt || now,
    lockedUntil: attempts.count + 1 >= MAX_ATTEMPTS
      ? now + LOCKOUT_DURATION_MS
      : null,
  };

  saveAttempts(identifier, updated);
  return updated;
};

export const clearAttempts = (identifier) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    delete stored[identifier];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {}
};

export const getRemainingAttempts = (identifier) => {
  const attempts = getAttempts(identifier);
  return Math.max(0, MAX_ATTEMPTS - attempts.count);
};