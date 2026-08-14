/**
 * Enterprise API Error Infrastructure & Handling Suite
 * Features: Subclass Hierarchy, Normalization Engine, Sanitization,
 * Validation Extraction, Telemetry Hooks, and Retry Analytics.
 */

// ==========================================
// 1. HTTP STATUS CONSTANTS
// ==========================================

export const HTTP_STATUS = Object.freeze({
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
});

// ==========================================
// 2. BASE API ERROR CLASS
// ==========================================

/**
 * Base error class for all API-related failures.
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Human-readable error description.
   * @param {Object} [options]
   * @param {number|null} [options.status=null] - HTTP status code.
   * @param {any} [options.data=null] - Parsed response payload.
   * @param {boolean} [options.isTimeout=false] - Whether the request hit a timeout.
   * @param {boolean} [options.isNetworkError=false] - Whether the network was unreachable.
   * @param {Object} [options.requestConfig={}] - Original request configuration (URL, method, headers).
   * @param {string|null} [options.requestId=null] - Server-issued correlation/request ID.
   * @param {number|null} [options.retryAfter=null] - Retry delay in seconds (from headers).
   * @param {Error|null} [options.cause=null] - Underlying original cause.
   */
  constructor(
    message,
    {
      status = null,
      data = null,
      isTimeout = false,
      isNetworkError = false,
      requestConfig = {},
      requestId = null,
      retryAfter = null,
      cause = null,
    } = {}
  ) {
    super(message, cause ? { cause } : undefined);
    
    this.name = this.constructor.name;
    this.status = status;
    this.data = data;
    this.isTimeout = isTimeout;
    this.isNetworkError = isNetworkError;
    this.requestConfig = sanitizeRequestConfig(requestConfig);
    this.requestId = requestId || extractRequestId(data, requestConfig);
    this.retryAfter = retryAfter;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Indicates whether the error is safe to auto-retry (5xx, timeouts, network issues, 429).
   */
  get isRetryable() {
    if (this.isTimeout || this.isNetworkError) return true;
    if (this.status === HTTP_STATUS.TOO_MANY_REQUESTS) return true;
    if (this.status && this.status >= 500 && this.status <= 599) return true;
    return false;
  }

  /**
   * Safely serializes the error for logging services (Sentry, Datadog, ELK).
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      requestId: this.requestId,
      isTimeout: this.isTimeout,
      isNetworkError: this.isNetworkError,
      isRetryable: this.isRetryable,
      retryAfter: this.retryAfter,
      timestamp: this.timestamp,
      data: this.data,
      request: {
        method: this.requestConfig.method,
        url: this.requestConfig.url,
      },
      stack: this.stack,
    };
  }
}

// ==========================================
// 3. SPECIALIZED HTTP ERROR SUBCLASSES
// ==========================================

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request", options = {}) {
    super(message, { ...options, status: HTTP_STATUS.BAD_REQUEST });
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = "Authentication required", options = {}) {
    super(message, { ...options, status: HTTP_STATUS.UNAUTHORIZED });
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Access forbidden", options = {}) {
    super(message, { ...options, status: HTTP_STATUS.FORBIDDEN });
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", options = {}) {
    super(message, { ...options, status: HTTP_STATUS.NOT_FOUND });
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Resource conflict detected", options = {}) {
    super(message, { ...options, status: HTTP_STATUS.CONFLICT });
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "Too many requests, please try again later.", options = {}) {
    super(message, { ...options, status: HTTP_STATUS.TOO_MANY_REQUESTS });
  }
}

export class CSRFError extends ApiError {
  constructor(message = "CSRF token validation failed", options = {}) {
    super(message, { ...options, status: HTTP_STATUS.FORBIDDEN });
  }
}

export class ServerError extends ApiError {
  constructor(message = "An unexpected server error occurred", options = {}) {
    super(message, {
      ...options,
      status: options.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}

// ==========================================
// 4. STRUCTURED VALIDATION ERROR CLASS
// ==========================================

/**
 * Normalizes field-level errors across multiple backend standards (Zod, Joi, Laravel, Spring).
 */
export class ValidationError extends ApiError {
  constructor(message = "Validation failed", { fieldErrors = [], ...options } = {}) {
    super(message, { ...options, status: HTTP_STATUS.UNPROCESSABLE_ENTITY });
    this.fieldErrors = Array.isArray(fieldErrors) ? fieldErrors : [];
  }

  /**
   * Retrieves array of error messages for a specific field name.
   * @param {string} fieldName 
   * @returns {string[]}
   */
  getErrorsForField(fieldName) {
    return this.fieldErrors
      .filter((err) => err.field === fieldName)
      .map((err) => err.message);
  }

  /**
   * Returns field errors mapped as key-value pairs `{ field: "Error message" }`.
   */
  toMappedObject() {
    return this.fieldErrors.reduce((acc, curr) => {
      if (curr.field) {
        acc[curr.field] = curr.message;
      }
      return acc;
    }, {});
  }
}

// ==========================================
// 5. PARSERS & SANITIZATION UTILITIES
// ==========================================

const SENSITIVE_HEADERS = ["authorization", "cookie", "x-csrf-token", "x-api-key"];

function sanitizeRequestConfig(config = {}) {
  if (!config) return {};
  const sanitizedHeaders = { ...(config.headers || {}) };

  Object.keys(sanitizedHeaders).forEach((key) => {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      sanitizedHeaders[key] = "[REDACTED]";
    }
  });

  return {
    method: config.method ? config.method.toUpperCase() : "GET",
    url: config.url || config.baseURL || "unknown",
    headers: sanitizedHeaders,
    timeout: config.timeout || null,
  };
}

function extractRequestId(data, headers = {}) {
  if (data?.requestId) return data.requestId;
  if (data?.traceId) return data.traceId;
  return (
    headers["x-request-id"] ||
    headers["x-trace-id"] ||
    headers["x-correlation-id"] ||
    null
  );
}

function parseRetryAfter(headers = {}) {
  const headerVal = headers["retry-after"] || headers["Retry-After"];
  if (!headerVal) return null;
  const parsed = parseInt(headerVal, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Standardizes common validation payload formats into `{ field, message }[]`.
 */
function extractFieldErrors(data) {
  if (!data) return [];

  // Standard Array format: [{ field: "email", message: "Invalid email" }]
  if (Array.isArray(data.errors)) {
    return data.errors.map((err) => ({
      field: err.field || err.path?.join(".") || err.param || "general",
      message: err.message || err.msg || "Invalid value",
    }));
  }

  // Object format (Laravel / ASP.NET): { errors: { email: ["Invalid email"] } }
  if (data.errors && typeof data.errors === "object") {
    return Object.entries(data.errors).flatMap(([field, msgs]) => {
      const messages = Array.isArray(msgs) ? msgs : [msgs];
      return messages.map((message) => ({ field, message: String(message) }));
    });
  }

  return [];
}

// ==========================================
// 6. OBSERVER & TELEMETRY REGISTRY
// ==========================================

class ApiErrorTelemetryRegistry {
  constructor() {
    this.listeners = new Set();
  }

  /**
   * Register a global listener for telemetry, user toasts, or reporting.
   * @param {Function} listener - Callback receiving the normalized ApiError instance.
   * @returns {Function} Unsubscribe function.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(error) {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error("Telemetry listener failure:", err);
      }
    });
  }
}

export const telemetryRegistry = new ApiErrorTelemetryRegistry();

// ==========================================
// 7. CORE NORMALIZATION ENGINE
// ==========================================

/**
 * Converts any thrown value (Axios, Fetch Response, Error, String) into a normalized ApiError hierarchy instance.
 * @param {unknown} error 
 * @returns {ApiError}
 */
export const normalizeApiError = (error) => {
  // Already normalized
  if (error instanceof ApiError) {
    telemetryRegistry.notify(error);
    return error;
  }

  const config = error?.config || error?.requestConfig || {};
  const response = error?.response;
  const status = response?.status || error?.status || null;
  const data = response?.data || error?.data || null;
  const headers = response?.headers || {};
  const retryAfter = parseRetryAfter(headers);
  const requestId = extractRequestId(data, headers);

  const baseOptions = {
    status,
    data,
    requestConfig: config,
    requestId,
    retryAfter,
    cause: error instanceof Error ? error : null,
  };

  let normalizedError;

  // 1. Timeout Errors
  if (
    error?.code === "ECONNABORTED" ||
    error?.name === "AbortError" ||
    error?.message?.includes("timeout")
  ) {
    const timeoutSec = (config.timeout || 15000) / 1000;
    const msg = `Request timed out after ${timeoutSec}s: ${config.method?.toUpperCase() || "GET"} ${config.url || ""}`;
    normalizedError = new ApiError(msg, { ...baseOptions, isTimeout: true });
  }

  // 2. Network Disconnections
  else if (!response && (error?.isAxiosError || error instanceof TypeError)) {
    const msg = error?.message || `Network error: unable to reach ${config.url || "server"}`;
    normalizedError = new ApiError(msg, { ...baseOptions, isNetworkError: true });
  }

  // 3. Status Code Classifications
  else {
    const serverMsg = data?.message || data?.error || error?.message;

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        normalizedError = new BadRequestError(serverMsg || "Bad Request", baseOptions);
        break;

      case HTTP_STATUS.UNAUTHORIZED:
        normalizedError = new AuthenticationError(serverMsg || "Session expired or unauthenticated", baseOptions);
        break;

      case HTTP_STATUS.FORBIDDEN:
        if (data?.code === "CSRF_INVALID" || serverMsg?.toLowerCase().includes("csrf")) {
          normalizedError = new CSRFError(serverMsg || "Invalid CSRF token", baseOptions);
        } else {
          normalizedError = new ForbiddenError(serverMsg || "You do not have permission to perform this action", baseOptions);
        }
        break;

      case HTTP_STATUS.NOT_FOUND:
        normalizedError = new NotFoundError(serverMsg || "Requested resource was not found", baseOptions);
        break;

      case HTTP_STATUS.CONFLICT:
        normalizedError = new ConflictError(serverMsg || "Resource conflict occurred", baseOptions);
        break;

      case HTTP_STATUS.UNPROCESSABLE_ENTITY: {
        const fieldErrors = extractFieldErrors(data);
        normalizedError = new ValidationError(serverMsg || "Validation failed", { ...baseOptions, fieldErrors });
        break;
      }

      case HTTP_STATUS.TOO_MANY_REQUESTS:
        normalizedError = new RateLimitError(serverMsg || "Too many requests. Please slow down.", baseOptions);
        break;

      default:
        if (status && status >= 500) {
          normalizedError = new ServerError(serverMsg || `Server error (${status})`, baseOptions);
        } else {
          normalizedError = new ApiError(
            serverMsg || `Request failed with status ${status || "UNKNOWN"}`,
            baseOptions
          );
        }
        break;
    }
  }

  telemetryRegistry.notify(normalizedError);
  return normalizedError;
};

// ==========================================
// 8. HELPER ACCESSSORS & UTILITIES
// ==========================================

export const getApiErrorStatus = (error) => {
  if (error instanceof ApiError) return error.status;
  return error?.status ?? error?.response?.status ?? null;
};

export const getApiErrorMessage = (error) => {
  if (error instanceof ApiError) return error.message;
  return (
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred"
  );
};

export const isApiError = (error) => error instanceof ApiError;

export const isRetryableError = (error) => {
  const normalized = normalizeApiError(error);
  return normalized.isRetryable;
};

/**
 * Returns a user-ready localized fallback message suitable for UI toasts/banners.
 */
export const getUserFriendlyMessage = (error) => {
  const normalized = normalizeApiError(error);

  if (normalized.isNetworkError) return "Network connection lost. Please check your internet connection.";
  if (normalized.isTimeout) return "The server took too long to respond. Please try again.";
  if (normalized.status === HTTP_STATUS.TOO_MANY_REQUESTS) return "You're making requests too quickly. Please pause and try again.";
  if (normalized.status === HTTP_STATUS.UNAUTHORIZED) return "Your session has expired. Please log in again.";
  if (normalized.status === HTTP_STATUS.FORBIDDEN) return "You don't have permission to perform this action.";
  if (normalized.status >= 500) return "Something went wrong on our end. Our engineering team has been notified.";

  return normalized.message;
};