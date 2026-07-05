import axios from "axios";
import { ENV } from "./env";
import { syncServerTimeFromHeader } from "../utils/timeSync";
import { createIntegrityHeader } from "../utils/security/requestIntegrity";
import { ApiError, RateLimitError, normalizeApiError } from "./api/errors.js";
import { setupRequestInterceptor, setupResponseInterceptor, setOnRequiresReauthHandler } from "./api/interceptors.js";
import { API_BASE_URL, validateBackendConfig } from "./backendConfig.js";

// ---------------------------------------------------------------------------
// Base API URL
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV === "development";

// Validate backend configuration on module load
const configValidation = validateBackendConfig();
if (!configValidation.isValid && isDev) {
  console.warn(`[API Config] ${configValidation.error}`);
}

const buildApiUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) return normalizedPath;
  return `${API_BASE_URL}${normalizedPath}`;
};

// ---------------------------------------------------------------------------
// Axios Instance
// ---------------------------------------------------------------------------

const REQUEST_TIMEOUT_MS = 15_000;

const API = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let onUnauthorized = null;
let onRequiresReauth = null;
let _authToken = null;

export const setOnUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};
export const setRequiresReauthHandler = (handler) => {
  onRequiresReauth = handler;
  setOnRequiresReauthHandler(handler);
};
export const setAuthToken = (token) => {
  _authToken = token;
};

/**
 * Normalise the optional config/token argument accepted by apiUtils methods.
 *
 * IMPORTANT — do not pass a raw JWT string as the third argument to
 * apiUtils.post / .put / .patch:
 *   apiUtils.post(url, data, token)   ← WRONG: token is silently discarded
 *
 * Authentication is carried automatically via the HttpOnly session cookie
 * (withCredentials: true on the Axios instance). Callers must never include
 * user identity fields (userId, adminId) in the request body either — the
 * backend must derive identity from the verified JWT, not from client-supplied
 * body fields.
 */
const normalizeRequestConfig = (configOrToken = {}) => {
  const config = typeof configOrToken === "string" ? {} : { ...configOrToken };

  if ("skipAuth" in config) {
    delete config.skipAuth;
  }
  return config;
};

const wrapHeaders = (headers) => {
  if (!headers) return { get: () => null };
  if (typeof headers.get === "function") return headers;
  return {
    get: (key) => headers[key] || headers[key.toLowerCase()] || null,
  };
};

const wrapAxiosResponse = (response) => {
  const wrappedHeaders = wrapHeaders(response.headers);
  return {
    ...response,
    headers: wrappedHeaders,
    ok: response.status >= 200 && response.status < 300,
    json: async () => response.data,
    text: async () =>
      typeof response.data === "string" ? response.data : JSON.stringify(response.data),
  };
};
const normalizeApiError = (error) => {
  const config = error.config || {};
  const status = error?.response?.status;

  if (
    error.code === "ECONNABORTED" ||
    error.name === "AbortError" ||
    error.message?.includes("timeout")
  ) {
    return new ApiError(
      `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s: ${config.method?.toUpperCase()} ${config.url}`,
      {
        status,
        isTimeout: true,
      }
    );
  }

  if (!error.response) {
    return new ApiError(
      error.message ||
        `Network error: ${config.method?.toUpperCase()} ${config.url}`,
      {
        status,
        isNetworkError: true,
      }
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
    {
      status,
      data: error.response?.data || null,
    }
  );
};

// We completely removed the `if (!config.signal)` block that was generating the Ghost AbortController.
API.interceptors.request.use(
  async (config) => {
    if (isDev) {
      console.debug(
        `[API ${config.method?.toUpperCase()}]`,
        buildApiUrl(config.url || "")
      );
    }

    try {
      const integrity = await createIntegrityHeader(config.data);

      config.headers = {
        ...config.headers,
        "X-Request-Integrity": integrity,
      };
    } catch (error) {
      if (isDev) {
        console.warn("Failed to generate request integrity header.", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => {
    const headerValue = response.headers.get("x-server-time") || response.headers.get("date");
    if (headerValue) {
      syncServerTimeFromHeader(headerValue);
    }
    return response;
  },
  async (error) => {
    const config = error.config || {};
    const status = error?.response?.status;

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    const retryCount = config._retryCount || 0;
    const isNonMutating = RETRYABLE_METHODS.has(config.method?.toUpperCase() ?? "");
    const isRetryableStatus = RETRYABLE_STATUS_CODES.includes(status);
    
    // Retry only idempotent reads/probes. Do not blind-retry mutations or 429s,
    // because those can duplicate writes or worsen server-side rate limiting.
    if (isNonMutating && isRetryableStatus && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
API.interceptors.request.use((config) => {
  if (isDev) {
    logger.info(`[API ${config.method?.toUpperCase()}]`, buildApiUrl(config.url || ""));
  }

  if (_authToken && _authToken !== "cookie-managed") {
    config.headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const method = config.method?.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = getCSRFToken();
    if (csrf) {
      config.headers["X-CSRF-Token"] = csrf;
    }
  }

setupRequestInterceptor(API, { isDev, buildApiUrl, getAuthToken, getOnUnauthorized });
setupResponseInterceptor(API, { isDev, timeoutMs: REQUEST_TIMEOUT_MS, getOnUnauthorized, getOnRequiresReauth });

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: buildApiUrl("/auth/login"),
    REGISTER: buildApiUrl("/auth/signup"),
    SIGNUP: buildApiUrl("/auth/signup"),
    LOGOUT: buildApiUrl("/auth/logout"),
    RESET_PASSWORD: buildApiUrl("/auth/reset-password"),
    REFRESH: buildApiUrl("/auth/refresh"),
  },
  EVENTS: {
    CREATE: buildApiUrl("/api/events/create"),
    ALL: buildApiUrl("/api/events"),
    LIST: buildApiUrl("/api/events"),
    DETAIL: (id) => buildApiUrl(`/api/events/${id}`),
    REGISTER: (id) => buildApiUrl(`/api/events/${id}/register`),
    AVAILABILITY: (id) => buildApiUrl(`/api/events/${id}/availability`),

    REGISTRANTS: (id) => buildApiUrl(`/api/events/${id}/registrants`),
    // Convenience helper — appends ?page=&size= for callers that build the
    // URL manually rather than going through eventFetchUtils.buildPaginatedUrl.
    PAGINATED: (page, size) => buildApiUrl(`/events?page=${page}&size=${size}`),
  },
  LIVE_AUDIENCE: {
    BASE: (eventId) => buildApiUrl(`/events/${eventId}/live-audience`),
    QUESTIONS: (eventId) => buildApiUrl(`/events/${eventId}/live-audience/questions`),
    UPVOTE: (eventId, questionId) => buildApiUrl(`/events/${eventId}/live-audience/questions/${questionId}/upvote`),
    FLAG: (eventId, questionId) => buildApiUrl(`/events/${eventId}/live-audience/questions/${questionId}/flag`),
    QUESTION_DETAIL: (eventId, questionId) => buildApiUrl(`/events/${eventId}/live-audience/questions/${questionId}`),
    POLLS: (eventId) => buildApiUrl(`/events/${eventId}/live-audience/polls`),
    POLL_STATUS: (eventId, pollId) => buildApiUrl(`/events/${eventId}/live-audience/polls/${pollId}/status`),
    POLL_VOTE: (eventId, pollId) => buildApiUrl(`/events/${eventId}/live-audience/polls/${pollId}/vote`),
  },
  PROJECTS: {
    ALL: buildApiUrl("/projects"),
    LIST: buildApiUrl("/projects"),
    DETAIL: (id) => buildApiUrl(`/projects/${id}`),
    CATEGORIES: buildApiUrl("/projects/categories"),
    SUBMIT: buildApiUrl("/projects"),
    UPVOTE: (id) => buildApiUrl(`/projects/${id}/upvote`),
    FORK: (id) => buildApiUrl(`/projects/${id}/fork`),
  },
  HACKATHONS: {
    LIST: buildApiUrl("/hackathons"),
    DETAIL: (id) => buildApiUrl(`/hackathons/${id}`),
    HOST: buildApiUrl("/hackathons"),
  },
  NOTIFICATIONS: {
    BASE: buildApiUrl("/notifications"),
    ALL: buildApiUrl("/notifications"),
    READ: (id) => (id ? buildApiUrl(`/notifications/${id}/read`) : ""),
    DELETE: (id) => (id ? buildApiUrl(`/notifications/${id}`) : ""),
    READ_ALL: buildApiUrl("/notifications/read-all"),
    PREFERENCES: buildApiUrl("/notifications/preferences"),
    PUSH_SUBSCRIBE: buildApiUrl("/notifications/push-subscriptions"),
    PUSH_UNSUBSCRIBE: buildApiUrl("/notifications/push-subscriptions/unsubscribe"),
  },
  USERS: {
    PROFILE: buildApiUrl("/api/users/profile"),
    ACHIEVEMENTS: buildApiUrl("/api/users/achievements"),
    // (#7653) Endpoint for persisting user preferences (theme, etc.) across devices
    PREFERENCES: buildApiUrl("/api/users/preferences"),
  },
  TICKETS: {
    VALIDATE: buildApiUrl("/tickets/validate"),
    CHECK_IN: buildApiUrl("/tickets/checkin"),
    HISTORY: buildApiUrl("/tickets/checkins"),
  },
  FEEDBACK: {
    BASE: buildApiUrl("/feedback"),
    BY_EVENT: (eventId) => {
      const params = new URLSearchParams({ eventId: String(eventId) });
      return buildApiUrl(`/feedback?${params.toString()}`);
    },
  },
  ADMIN: {
    USERS: buildApiUrl("/admin/users"),
    USER: (id) => buildApiUrl(`/admin/users/${id}`),
    EVENTS: buildApiUrl("/admin/events"),
    EVENT: (id) => buildApiUrl(`/admin/events/${id}`),
    STATS: buildApiUrl("/admin/stats"),
  },
  VALIDATION: {
    EMAIL: (email) => buildApiUrl(`/api/validate/email/${encodeURIComponent(email)}`),
    USERNAME: (username) => buildApiUrl(`/api/validate/username/${encodeURIComponent(username)}`),
    PHONE: buildApiUrl("/api/validate/phone"),
  },
};

const normalizeRequestConfig = (configOrToken = {}) => {
  const config = typeof configOrToken === "string" ? {} : { ...configOrToken };
  if ("skipAuth" in config) delete config.skipAuth;
  return config;
};

const wrapHeaders = (headers) => {
  if (!headers) return { get: () => null };
  if (typeof headers.get === "function") return headers;
  return { get: (key) => headers[key] || headers[key.toLowerCase()] || null };
};

const wrapAxiosResponse = (response) => {
  const wrappedHeaders = wrapHeaders(response.headers);
  return {
    ...response,
    headers: wrappedHeaders,
    ok: response.status >= 200 && response.status < 300,
    json: async () => {
      // Guard against non-JSON responses (e.g. 502 HTML) evaluating incorrectly
      if (typeof response.data === "string") {
        try {
          return JSON.parse(response.data);
        } catch (_e) {
          throw new Error("Received non-JSON response from server");
        }
      }
      return response.data || {};
    },
    text: async () =>
      typeof response.data === "string" ? response.data : JSON.stringify(response.data),
  };
};

export const apiUtils = {
  get: (url, config = {}) =>
    API.get(url, normalizeRequestConfig(config)).then(wrapAxiosResponse),
  post: (url, data = {}, config = {}) =>
    API.post(url, data, normalizeRequestConfig(config)).then(wrapAxiosResponse),
  put: (url, data = {}, config = {}) =>
    API.put(url, data, normalizeRequestConfig(config)).then(wrapAxiosResponse),
  patch: (url, data = {}, config = {}) =>
    API.patch(url, data, normalizeRequestConfig(config)).then(wrapAxiosResponse),
  delete: (url, config = {}) =>
    API.delete(url, normalizeRequestConfig(config)).then(wrapAxiosResponse),
  request: async (method, url, data = null, options = {}) => {
    const config = normalizeRequestConfig(options);
    if (options.signal) config.signal = options.signal;
    if (options.headers) config.headers = { ...config.headers, ...options.headers };
    config.method = method.toLowerCase();
    const axiosResponse = await API.request({ url, method: config.method, data, ...config });
    const wrappedHeaders = wrapHeaders(axiosResponse.headers);
    return {
      response: {
        status: axiosResponse.status,
        ok: axiosResponse.status >= 200 && axiosResponse.status < 300,
        headers: wrappedHeaders,
      },
      data: axiosResponse.data,
    };
  },
};

export default API;

export { ApiError, RateLimitError, normalizeApiError };

// Centralized configuration cache store for fallback endpoints
export const apiConfigCache = {
  store: new Map(),
  get(key) {
    return this.store.get(key);
  },
  set(key, val) {
    this.store.set(key, val);
  },
  clear() {
    this.store.clear();
  },
};
