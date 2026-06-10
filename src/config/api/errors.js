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
