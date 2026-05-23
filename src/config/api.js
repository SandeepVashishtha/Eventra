import axios from "axios";

// ---------------------------------------------------------------------------
// Base API URL
// ---------------------------------------------------------------------------

const normalizeApiBaseUrl = (value = "") => {
  if (!value) {
    return "";
  }

  return value.replace(/\/+$/, "").replace(/\/api$/, "");
};

const isDevelopment = process.env.NODE_ENV === "development";

const resolveEnvApiBaseUrl = () =>
  isDevelopment
    ? ""
    : normalizeApiBaseUrl(
        process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "",
      );

export const API_BASE_URL = resolveEnvApiBaseUrl();

const buildApiUrl = (path = "") => {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};

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
const isDev = isDevelopment;

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
  baseURL: API_BASE_URL || undefined,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// ---------------------------------------------------------------------------
// Global 401 Unauthorized Handler
// ---------------------------------------------------------------------------

let onUnauthorized = null;

/**
 * Register unauthorized callback.
 * AuthContext sets this during initialization so that any 401 response
 * triggers a centralized logout + redirect.
 */
export const setOnUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const normalizeRequestConfig = (configOrToken = {}, maybeToken) => {
  const config = typeof configOrToken === "string" ? {} : { ...configOrToken };
  const token =
    typeof configOrToken === "string"
      ? configOrToken
      : typeof maybeToken === "string"
        ? maybeToken
        : "";

  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
};

const normalizeAxiosResponse = (response) => ({
  data: response.data,
  status: response.status,
  statusText: response.statusText,
  headers: response.headers,
  ok: response.status >= 200 && response.status < 300,
  json: async () => response.data,
  text: async () =>
    typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data),
});

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
    console.debug(
      `[API ${config.method?.toUpperCase()}]`,
      buildApiUrl(config.url || ""),
    );
  }

  return config;
});

// ---------------------------------------------------------------------------
// Response Interceptor — 401 handling, retry, error normalization
// ---------------------------------------------------------------------------

API.interceptors.response.use(
  // Success — pass through
  (response) => response,

  // Error — normalize and optionally retry
  async (error) => {
    const config = error.config || {};

    // --- 401 Unauthorized: trigger session cleanup ---
    if (error?.response?.status === 401) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }

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
// API Endpoints
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: buildApiUrl("/api/auth/login"),
    REGISTER: buildApiUrl("/api/auth/signup"),
    SIGNUP: buildApiUrl("/api/auth/signup"),
    LOGOUT: buildApiUrl("/api/auth/logout"),
    RESET_PASSWORD: buildApiUrl("/api/auth/reset-password"),
  },

  EVENTS: {
    CREATE: buildApiUrl("/api/events/create"),
    ALL: buildApiUrl("/api/events"),
    LIST: buildApiUrl("/api/events"),
    DETAIL: (id) => buildApiUrl(`/api/events/${id}`),
    REGISTER: (id) => buildApiUrl(`/api/events/${id}/register`),
  },

  PROJECTS: {
    ALL: buildApiUrl("/api/projects"),
    LIST: buildApiUrl("/api/projects"),
    DETAIL: (id) => buildApiUrl(`/api/projects/${id}`),
    CATEGORIES: buildApiUrl("/api/projects/categories"),
    SUBMIT: buildApiUrl("/api/projects"),
  },

  NOTIFICATIONS: {
    ALL: buildApiUrl("/api/notifications"),
    BASE: buildApiUrl("/api/notifications"),
    READ: (id) => buildApiUrl(`/api/notifications/${id}/read`),
    READ_ALL: buildApiUrl("/api/notifications/read-all"),
  },

  USERS: {
    PROFILE: buildApiUrl("/api/users/profile"),
    ACHIEVEMENTS: buildApiUrl("/api/users/achievements"),
  },
};

// ---------------------------------------------------------------------------
// API Utility Methods
// ---------------------------------------------------------------------------
// Signatures are 100% backwards-compatible. Existing callers continue to
// receive axios response objects and handle them as before.

export const apiUtils = {
  get: async (url, configOrToken = {}) =>
    normalizeAxiosResponse(await API.get(url, normalizeRequestConfig(configOrToken))),

  post: async (url, data = {}, configOrToken = {}) =>
    normalizeAxiosResponse(await API.post(url, data, normalizeRequestConfig(configOrToken))),

  put: async (url, data = {}, configOrToken = {}) =>
    normalizeAxiosResponse(await API.put(url, data, normalizeRequestConfig(configOrToken))),

  patch: async (url, data = {}, configOrToken = {}) =>
    normalizeAxiosResponse(await API.patch(url, data, normalizeRequestConfig(configOrToken))),

  delete: async (url, configOrToken = {}) =>
    normalizeAxiosResponse(await API.delete(url, normalizeRequestConfig(configOrToken))),
};

// ---------------------------------------------------------------------------
// Default Export
// ---------------------------------------------------------------------------

export default API;