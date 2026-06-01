export const SAFE_RETRY_METHODS = ["GET", "HEAD", "OPTIONS"];

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Automatic retries are limited to HTTP methods that are safe/idempotent by
 * definition. Mutating methods must opt into their own duplicate protection
 * before retrying, otherwise a timeout or connection reset can create the same
 * record, payment, or action more than once.
 */
export const isSafeRetryMethod = (method = "") =>
  SAFE_RETRY_METHODS.includes(String(method).toUpperCase());

export const isRetryableApiError = (error) => {
  const status = error?.response?.status ?? error?.status;
  const hasStatus = typeof status === "number";
  const isTimeout =
    error?.code === "ECONNABORTED" ||
    error?.name === "AbortError" ||
    error?.isTimeout === true ||
    error?.message?.toLowerCase?.().includes("timeout");
  const isNetworkError =
    error?.isNetworkError === true || (!error?.response && !hasStatus);

  return isTimeout || isNetworkError || RETRYABLE_STATUS_CODES.includes(status);
};

export const shouldRetryApiRequest = ({
  method,
  error,
  retryCount = 0,
  maxRetries = 1,
} = {}) =>
  isSafeRetryMethod(method) &&
  retryCount < maxRetries &&
  isRetryableApiError(error);
