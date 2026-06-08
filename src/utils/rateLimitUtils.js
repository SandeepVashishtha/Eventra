/**
 * Shared rate-limiting utilities used by authentication forms.
 *
 * These helpers operate entirely in the browser — they are a UX-layer defence
 * that raises the cost of automated attacks and protects the backend from
 * being flooded. They do NOT replace server-side rate limiting; both layers
 * should be present.
 */

/** sessionStorage key names for persisted rate-limit state. */
export const STORAGE_KEY_ATTEMPTS = 'eventra:login:attempts';
export const STORAGE_KEY_LOCKOUT_UNTIL = 'eventra:login:lockoutUntil';
export const STORAGE_KEY_RESET_LAST_SUBMIT = 'eventra:passwordReset:lastSubmit';

/** Maximum number of failed login attempts before a lockout is imposed. */
export const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Reads persisted rate-limit state from sessionStorage.
 * Returns zeroed defaults if the data is missing, corrupt, or from a future
 * lockout that has already expired.
 *
 * @returns {{ attempts: number, lockoutUntil: number }}
 */
export function readPersistedRateLimit() {
  try {
    const rawAttempts = sessionStorage.getItem(STORAGE_KEY_ATTEMPTS);
    const rawLockout = sessionStorage.getItem(STORAGE_KEY_LOCKOUT_UNTIL);

    const attempts = rawAttempts !== null ? parseInt(rawAttempts, 10) : 0;
    const lockoutUntil = rawLockout !== null ? parseInt(rawLockout, 10) : 0;

    if (!Number.isFinite(attempts) || attempts < 0) return { attempts: 0, lockoutUntil: 0 };

    // Discard expired lockouts — don't start with a stale "locked" state
    const validLockout = Number.isFinite(lockoutUntil) && lockoutUntil > Date.now()
      ? lockoutUntil
      : 0;

    return { attempts, lockoutUntil: validLockout };
  } catch {
    return { attempts: 0, lockoutUntil: 0 };
  }
}

/**
 * Writes current rate-limit state to sessionStorage.
 * sessionStorage is tab-scoped and cleared when the tab is closed, which
 * provides the right scope: resist refresh-bypass within a tab session while
 * not permanently blocking a legitimate user across browser restarts.
 *
 * @param {number} attempts
 * @param {number} lockoutUntil - Unix timestamp (ms), 0 if not locked.
 */
export function persistRateLimit(attempts, lockoutUntil) {
  try {
    sessionStorage.setItem(STORAGE_KEY_ATTEMPTS, String(attempts));
    sessionStorage.setItem(STORAGE_KEY_LOCKOUT_UNTIL, String(lockoutUntil));
  } catch {
    // sessionStorage may be full or blocked in privacy mode — fail silently.
    // The in-memory state is still active; this is a best-effort durability layer.
  }
}

/**
 * Removes all persisted rate-limit state from sessionStorage.
 * Call this on successful login or intentional reset.
 */
export function clearPersistedRateLimit() {
  try {
    sessionStorage.removeItem(STORAGE_KEY_ATTEMPTS);
    sessionStorage.removeItem(STORAGE_KEY_LOCKOUT_UNTIL);
  } catch {
    // Ignore — clearing is best-effort
  }
}

/**
 * Parses the Retry-After HTTP response header value into milliseconds.
 * Handles both the integer-seconds form ("30") and the HTTP-date form.
 *
 * @param {string|null|undefined} headerValue - Raw Retry-After header value.
 * @returns {number} Delay in milliseconds, or 0 if unparseable.
 */
export function parseRetryAfterMs(headerValue) {
  if (!headerValue) return 0;

  const trimmed = String(headerValue).trim();

  // Integer seconds form: "30"
  const asSeconds = parseInt(trimmed, 10);
  if (!isNaN(asSeconds) && String(asSeconds) === trimmed) {
    return Math.max(0, asSeconds) * 1000;
  }

  // HTTP-date form: "Wed, 21 Oct 2025 07:28:00 GMT"
  const asDate = Date.parse(trimmed);
  if (!isNaN(asDate)) {
    return Math.max(0, asDate - Date.now());
  }

  return 0;
}

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
