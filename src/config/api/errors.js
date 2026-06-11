export class ApiError extends Error {
  constructor(
    message,
    { status = null, data = null, isTimeout = false, isNetworkError = false } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isTimeout = isTimeout;
    this.isNetworkError = isNetworkError;
  }
}

export class RateLimitError extends ApiError {
  constructor(message, { status = 429, data = null } = {}) {
    super(message, { status, data });
    this.name = "RateLimitError";
  }
}

export class CSRFError extends ApiError {
  constructor(message, { status = 403, data = null } = {}) {
    super(message, { status, data });
    this.name = "CSRFError";
  }
}
export const normalizeApiError = (error) => {
  const config = error.config || {};
  const status = error?.response?.status;

  if (
    error.code === "ECONNABORTED" ||
    error.name === "AbortError" ||
    error.message?.includes("timeout")
  ) {
    return new ApiError(
      `Request timed out after ${config.timeout || 15000 / 1000}s: ${config.method?.toUpperCase()} ${config.url}`,
      { status, isTimeout: true }
    );
  }

  if (!error.response) {
    return new ApiError(
      error.message || `Network error: ${config.method?.toUpperCase()} ${config.url}`,
      { status, isNetworkError: true }
    );
  }

  if (status === 429) {
    return new RateLimitError(
      error.response?.data?.message || "Too many requests, please try again later.",
      { status, data: error.response?.data || null }
    );
  }

  return new ApiError(
    error.response?.data?.message ||
      error.message ||
      `Request failed with status ${status}`,
    { status, data: error.response?.data || null }
  );
};
