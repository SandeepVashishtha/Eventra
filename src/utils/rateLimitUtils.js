/**
 * Exponential Backoff with Full-Jitter Reconnection Retry Calculator.
 * Prevents thundering-herd API server overload during network recovery.
 */

const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

export function calculateJitteredBackoff(attemptCount = 0) {
  const cap = Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * Math.pow(2, attemptCount));
  return Math.floor(Math.random() * cap);
}

export function isRateLimitError(error) {
  return error?.status === 429 || error?.response?.status === 429;
}

// Auth pages import the login-lockout symbols from `utils/rateLimitUtils`
// (Vite alias -> this module). Those helpers live in
// `src/components/utils/rateLimitUtils.js`; re-export them here so the
// existing named imports resolve instead of throwing ERR_MODULE_NOT_FOUND
// at module load (which crashes the Login and Password Reset pages). See #14560.
export {
  MAX_LOGIN_ATTEMPTS,
  parseRetryAfterMs,
  RESET_COOLDOWN_SECONDS,
  secondsUntilUnlock,
  STORAGE_KEY_RESET_LAST_SUBMIT,
} from "../components/utils/rateLimitUtils.js";
