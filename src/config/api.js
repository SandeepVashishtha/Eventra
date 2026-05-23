import axios from "axios";

// ---------------------------------------------------------------------------
// Base API URL
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://eventra-backend-dgcae3etebbag8ft.centralindia-01.azurewebsites.net";

// ---------------------------------------------------------------------------
// Network Resilience Configuration
// ---------------------------------------------------------------------------

/** Default request timeout in milliseconds (15 seconds). */
const REQUEST_TIMEOUT_MS = 15_000;

/** HTTP status codes that are safe to retry (transient server errors). */
const RETRYABLE_STATUS_CODES = [502, 503, 504];

/** Maximum number of automatic retries for retryable errors. */
const MAX_RETRIES = 1;

/** Base delay between retries in milliseconds. */
const RETRY_DELAY_MS = 1_000;

/**
 * isDev — true only in local development.
 * Used to gate verbose console.debug statements so they don't appear in production builds.
 */
const isDev = process.env.NODE_ENV === "development";

// ---------------------------------------------------------------------------
// Normalized API Error
// ---------------------------------------------------------------------------

/**
 * A structured error class for consistent error handling across consumers.
 * Callers can check `isTimeout`, `isNetworkError`, or `status` to decide
 * how to respond without parsing raw axios error shapes.
 */
export class ApiError extends Error {
  /**
   * @param {string} message          - Human-readable error description.
   * @param {object} options
   * @param {number|null} options.status        - HTTP status code (null for network/timeout).
   * @param {*}           options.data          - Parsed response body if available.
   * @param {boolean}     options.isTimeout     - True when the request was aborted by timeout.
   * @param {boolean}     options.isNetworkError - True for connectivity failures.
   */
  constructor(message, { status = null, data = null, isTimeout = false, isNetworkError = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isTimeout = isTimeout;
    this.isNetworkError = isNetworkError;
  }
}

// ---------------------------------------------------------------------------
// Axios Instance
// ---------------------------------------------------------------------------

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for cookie-based auth/session handling
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// Interceptors
// ---------------------------------------------------------------------------

// Request Interceptor: Ensures every request has the auth token (if available)
API.interceptors.request.use(
  (config) => {
    // Attempt to get token from localStorage (adjust key name if your app uses a different one)
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 Unauthorized Handler
let onUnauthorized = null;

export const setOnUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};
/**
 * Register unauthorized callback.
 * AuthContext sets this during initialization so that any 401 response
 * triggers a centralized logout + redirect.
 */
export const setOnUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// ---------------------------------------------------------------------------
// Request Interceptor — per-request AbortController & debug logging
// ---------------------------------------------------------------------------

API.interceptors.request.use((config) => {
  // Attach a per-request AbortController so callers can cancel if needed
  if (!config.signal) {
    const controller = new AbortController();
    config.signal = controller.signal;
    config._abortController = controller;
  }

  if (isDev) {
    console.debug(`[API ${config.method?.toUpperCase()}]`, config.url);
  }

  return config;
});

// ---------------------------------------------------------------------------
// Response Interceptor — 401 handling, retry, error normalization
// ---------------------------------------------------------------------------

API.interceptors.response.use(
  // Success — pass through
  (response) => response,
  (error) => {

  // Error — normalize and optionally retry
  async (error) => {
    const config = error.config || {};

    // --- 401 Unauthorized: trigger session cleanup ---
    if (error?.response?.status === 401) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);

    // --- Automatic retry for transient 5xx errors ---
    const retryCount = config._retryCount || 0;
    const status = error?.response?.status;

    if (
      RETRYABLE_STATUS_CODES.includes(status) &&
      retryCount < MAX_RETRIES
    ) {
      config._retryCount = retryCount + 1;

      if (isDev) {
        console.debug(
          `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying in ${RETRY_DELAY_MS}ms (attempt ${config._retryCount})…`
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

      return API(config);
    }

    // --- Normalize error into ApiError ---

    // Timeout (axios uses ECONNABORTED code, AbortController uses AbortError)
    if (error.code === "ECONNABORTED" || error.name === "AbortError" || error.message?.includes("timeout")) {
      throw new ApiError(
        `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s: ${config.method?.toUpperCase()} ${config.url}`,
        { isTimeout: true }
      );
    }

    // Network error (offline, DNS failure, CORS, etc.)
    if (!error.response) {
      throw new ApiError(
        error.message || `Network error: ${config.method?.toUpperCase()} ${config.url}`,
        { isNetworkError: true }
      );
    }

    // Server error with response body
    throw new ApiError(
      error.response?.data?.message || error.message || `Request failed with status ${status}`,
      {
        status: error.response.status,
        data: error.response.data,
      }
    );
  }
);

// ---------------------------------------------------------------------------
// API Endpoints & Utilities
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    RESET_PASSWORD: "/auth/reset-password",
  },
  EVENTS: {
    CREATE: "/events/create",
    ALL: "/events",
    DETAIL: (id) => `/events/${id}`,
    REGISTER: (id) => `/events/${id}/register`,
  },
  PROJECTS: {
    ALL: "/projects",
    DETAIL: (id) => `/projects/${id}`,
    CATEGORIES: "/projects/categories",
    SUBMIT: "/projects",
  },
  NOTIFICATIONS: {
    ALL: "/notifications",
    READ: (id) => `/notifications/${id}/read`,
    READ_ALL: "/notifications/read-all",
  },
  USERS: {
    PROFILE: "/users/profile",
    ACHIEVEMENTS: "/users/achievements",
  },
};

// Exporting API as default for direct use (e.g., API.get(...))
// and exporting apiUtils for those who prefer the wrapper pattern.
export const apiUtils = {
  get: (url, config = {}) => API.get(url, config),
  post: (url, data = {}, config = {}) => API.post(url, data, config),
  put: (url, data = {}, config = {}) => API.put(url, data, config),
  patch: (url, data = {}, config = {}) => API.patch(url, data, config),
  delete: (url, config = {}) => API.delete(url, config),
};

export default API;
// ---------------------------------------------------------------------------
// API Utility Methods
// ---------------------------------------------------------------------------
// Signatures are 100% backwards-compatible. Existing callers continue to
// receive axios response objects and handle them as before.

export const apiUtils = {
  get: (url, config = {}) => API.get(url, config),

  post: (url, data = {}, config = {}) => API.post(url, data, config),

  put: (url, data = {}, config = {}) => API.put(url, data, config),

  patch: (url, data = {}, config = {}) => API.patch(url, data, config),

  delete: (url, config = {}) => API.delete(url, config),
};

// ---------------------------------------------------------------------------
// Default Export
// ---------------------------------------------------------------------------

export default API;
