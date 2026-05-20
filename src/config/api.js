// API Configuration
// Uses relative paths in development so the CRA proxy (package.json "proxy" field)
// forwards requests to the backend — no CORS issues.
// In production, REACT_APP_API_URL should be set to the backend base URL.
const AUTH_API_BASE_PATH = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/auth`
  : '/api/auth'; // ← goes through CRA proxy in dev

// fix: shared base URL for all non-auth API routes
const API_BASE_PATH = process.env.REACT_APP_API_URL || '';

// API endpoints — auth, events, projects, notifications, and users
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_API_BASE_PATH}/login`,
    REGISTER: `${AUTH_API_BASE_PATH}/signup`,
  },
  EVENTS: {
    CREATE: `${API_BASE_PATH}/api/events`,
    REGISTER: (id) => `${API_BASE_PATH}/api/events/${id}/register`,
    LIST: `${API_BASE_PATH}/api/events`,
    DETAIL: (id) => `${API_BASE_PATH}/api/events/${id}`,
  },
  PROJECTS: {
    LIST: `${API_BASE_PATH}/api/projects`,
    CATEGORIES: `${API_BASE_PATH}/api/projects/categories`,
    SUBMIT: `${API_BASE_PATH}/api/projects`,
    DETAIL: (id) => `${API_BASE_PATH}/api/projects/${id}`,
  },
  NOTIFICATIONS: {
    BASE: `${API_BASE_PATH}/api/notifications`,
    READ: (id) => `${API_BASE_PATH}/api/notifications/${id}/read`,
    READ_ALL: `${API_BASE_PATH}/api/notifications/read-all`,
  },
  USERS: {
    ACHIEVEMENTS: `${API_BASE_PATH}/api/users/achievements`,
    PROFILE: `${API_BASE_PATH}/api/users/profile`,
  },
};

// Helper function to get authorization headers
export const getAuthHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// ---------------------------------------------------------------------------
// Global 401 Unauthorized handler
// ---------------------------------------------------------------------------
// AuthContext registers a callback here so that any API call receiving a 401
// can trigger a centralized logout + redirect without circular imports.
let _onUnauthorized = null;

/**
 * Register a callback that will be invoked whenever an API response returns
 * HTTP 401 Unauthorized. AuthContext sets this during initialization.
 *
 * @param {Function|null} callback - A function to call on 401 responses, or null to deregister.
 */
export const setOnUnauthorizedHandler = (callback) => {
  _onUnauthorized = callback;
};

/**
 * Process an API response and trigger the unauthorized handler if the
 * server responds with 401, indicating an expired or invalid token.
 *
 * @param {Response} response - The fetch Response object.
 * @returns {Response} The same response (pass-through for chaining).
 */
const handleUnauthorized = (response) => {
  if (response.status === 401 && typeof _onUnauthorized === 'function') {
    _onUnauthorized();
  }
  return response;
};

/**
 * isDev — true only in local development.
 * Used to gate verbose console.log statements so they don't appear in production builds.
 */
const isDev = process.env.NODE_ENV === 'development';

// ---------------------------------------------------------------------------
// Network Resilience Configuration
// ---------------------------------------------------------------------------

/** Default request timeout in milliseconds. */
const DEFAULT_TIMEOUT_MS = 15_000;

/** HTTP status codes that are safe to retry (transient server errors). */
const RETRYABLE_STATUS_CODES = [502, 503, 504];

/** Maximum number of automatic retries for retryable errors. */
const MAX_RETRIES = 1;

/** Base delay between retries in milliseconds (doubles on each attempt). */
const RETRY_BASE_DELAY_MS = 1_000;

// ---------------------------------------------------------------------------
// Normalized API Error
// ---------------------------------------------------------------------------

/**
 * A structured error thrown by the API utility layer.
 * Gives callers a consistent shape to handle errors — status code, parsed
 * response body, and boolean flags for timeout and network errors.
 */
export class ApiError extends Error {
  /**
   * @param {string} message       - Human-readable error message.
   * @param {object} options
   * @param {number|null} options.status       - HTTP status code, or null for network/timeout errors.
   * @param {*}           options.data         - Parsed response body (if available).
   * @param {boolean}     options.isTimeout    - True when the request was aborted due to timeout.
   * @param {boolean}     options.isNetworkError - True for connectivity failures (offline, DNS, etc.).
   */
  constructor(message, { status = null, data = null, isTimeout = false, isNetworkError = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isTimeout = isTimeout;
    this.isNetworkError = isNetworkError;
  }
}

// ---------------------------------------------------------------------------
// Internal: Resilient fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps native `fetch` with timeout and optional retry logic.
 *
 * - **Timeout**: Uses `AbortController` to abort requests that exceed
 *   `DEFAULT_TIMEOUT_MS`. Throws an `ApiError` with `isTimeout: true`.
 *
 * - **Retry**: Automatically retries on 502/503/504 responses up to
 *   `MAX_RETRIES` times with exponential backoff. Callers can opt out
 *   by passing `retryable: false` (used for auth endpoints to avoid
 *   duplicate side-effects).
 *
 * - **401 handling**: Delegates to the existing `handleUnauthorized`
 *   callback on every response, preserving the global session-cleanup
 *   behaviour registered by AuthContext.
 *
 * @param {string} method     - HTTP method (GET, POST, …).
 * @param {string} url        - Fully-qualified request URL.
 * @param {object} [options]
 * @param {object|null} options.body    - Request body (will be JSON-stringified).
 * @param {string|null} options.token   - JWT bearer token.
 * @param {boolean}     options.retryable - Whether 5xx retries are enabled (default: true).
 * @returns {Promise<Response>} The raw `Response` object (same contract as before).
 */
const resilientFetch = async (method, url, { body = null, token = null, retryable = true } = {}) => {
  let lastError = null;
  const attempts = retryable ? MAX_RETRIES + 1 : 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    // Set up per-attempt timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      if (isDev) console.debug(`[API ${method}]`, url, attempt > 0 ? `(retry ${attempt})` : '');

      const fetchOptions = {
        method,
        headers: getAuthHeaders(token),
        signal: controller.signal,
      };

      if (body !== null) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Delegate 401 handling to AuthContext's registered callback
      handleUnauthorized(response);

      // If the response is a retryable server error and we have retries left, back off and retry
      if (retryable && RETRYABLE_STATUS_CODES.includes(response.status) && attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        if (isDev) console.debug(`[API ${method}] ${url} returned ${response.status}, retrying in ${delay}ms…`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      // Timeout — AbortController fires an AbortError
      if (error.name === 'AbortError') {
        throw new ApiError(
          `Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s: ${method} ${url}`,
          { isTimeout: true }
        );
      }

      // Network error (offline, DNS failure, CORS, etc.) — retry if allowed
      if (retryable && attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        if (isDev) console.debug(`[API ${method}] Network error for ${url}, retrying in ${delay}ms…`, error.message);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // All attempts exhausted — wrap in ApiError for consistent handling
  console.error(`[API ${method} Error]`, url, lastError);
  throw new ApiError(
    lastError?.message || `Network error: ${method} ${url}`,
    { isNetworkError: true }
  );
};

// ---------------------------------------------------------------------------
// Public API utility functions
// ---------------------------------------------------------------------------
// Method signatures are 100% backwards-compatible. Existing callers continue
// to receive the raw `Response` object and handle it as before.

export const apiUtils = {
  /**
   * HTTP GET
   * @param {string} url
   * @param {string|null} token - JWT bearer token
   */
  get: (url, token = null) =>
    resilientFetch('GET', url, { token }),

  /**
   * HTTP POST
   * @param {string} url
   * @param {object} data - Request body
   * @param {string|null} token - JWT bearer token
   */
  post: (url, data, token = null) =>
    resilientFetch('POST', url, { body: data, token }),

  /**
   * HTTP PUT — full resource replacement
   * @param {string} url
   * @param {object} data - Request body
   * @param {string|null} token - JWT bearer token
   */
  put: (url, data = {}, token = null) =>
    resilientFetch('PUT', url, { body: data, token }),

  /**
   * HTTP PATCH — partial resource update
   * @param {string} url
   * @param {object} data - Partial update body
   * @param {string|null} token - JWT bearer token
   */
  patch: (url, data = {}, token = null) =>
    resilientFetch('PATCH', url, { body: data, token }),

  /**
   * HTTP DELETE
   * @param {string} url
   * @param {string|null} token - JWT bearer token
   */
  delete: (url, token = null) =>
    resilientFetch('DELETE', url, { token }),
};

