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
