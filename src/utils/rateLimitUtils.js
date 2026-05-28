/**
 * Shared rate-limiting utilities used by authentication forms.
 *
 * These helpers operate entirely in the browser — they are a UX-layer defence
 * that raises the cost of automated attacks and protects the backend from
 * being flooded. They do NOT replace server-side rate limiting; both layers
 * should be present.
 */

/** Maximum number of failed login attempts before a lockout is imposed. */
export const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Minimum number of seconds a user must wait between password-reset
 * submissions. Prevents reset-email spam against a victim address.
 */
export const RESET_COOLDOWN_SECONDS = 60;

/**
 * Returns the exponential backoff delay (in milliseconds) for a given number
 * of failed attempts. The delay starts after MAX_LOGIN_ATTEMPTS failures and
 * is capped at 30 seconds so legitimate users are not locked out indefinitely.
 *
 * Attempt 5 → 2 s, attempt 6 → 4 s, attempt 7 → 8 s … capped at 30 s.
 *
 * @param {number} attempts - Total failed attempts so far (1-based).
 * @returns {number} Lockout duration in milliseconds.
 */
export function getBackoffDelay(attempts) {
  if (attempts < MAX_LOGIN_ATTEMPTS) return 0;
  const exponent = attempts - (MAX_LOGIN_ATTEMPTS - 1);
  return Math.min(30, Math.pow(2, exponent)) * 1000;
}

/**
 * Formats a remaining-cooldown duration into a human-readable string.
 *
 * @param {number} remainingMs - Remaining time in milliseconds.
 * @returns {string} E.g. "29s", "1m 4s".
 */
export function formatCountdown(remainingMs) {
  if (remainingMs <= 0) return '0s';
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Returns the number of whole seconds remaining in a lockout period.
 *
 * @param {number} lockoutUntil - Unix timestamp (ms) when lockout expires.
 * @returns {number} Seconds remaining, never negative.
 */
export function secondsUntilUnlock(lockoutUntil) {
  return Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
}
