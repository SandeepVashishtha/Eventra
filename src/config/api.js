import axios from "axios";
import { ApiError, RateLimitError } from "./api/errors.js";
import { setupRequestInterceptor, setupResponseInterceptor } from "./api/interceptors.js";
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
let _authToken = null;

export const setOnUnauthorizedHandler = (handler) => { onUnauthorized = handler; };
export const setAuthToken = (token) => { _authToken = token; };

const getAuthToken = () => _authToken;
const getOnUnauthorized = () => onUnauthorized;

setupRequestInterceptor(API, { isDev, buildApiUrl, getAuthToken, getOnUnauthorized });
setupResponseInterceptor(API, { isDev, timeoutMs: REQUEST_TIMEOUT_MS, getOnUnauthorized });

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
  },
  EVENTS: {
    CREATE: buildApiUrl("/events/create"),
    ALL: buildApiUrl("/events"),
    LIST: buildApiUrl("/events"),
    DETAIL: (id) => buildApiUrl(`/events/${id}`),
    SCHEDULE: (id) => buildApiUrl(`/events/${id}/schedule`),
    REGISTER: (id) => buildApiUrl(`/events/${id}/register`),
    AVAILABILITY: (id) => buildApiUrl(`/events/${id}/availability`),
    CANCEL: (id) => buildApiUrl(`/events/${id}/cancel`),  
    REGISTRANTS: (id) => buildApiUrl(`/events/${id}/registrants`),
    // Convenience helper — appends ?page=&size= for callers that build the
    // URL manually rather than going through eventFetchUtils.buildPaginatedUrl.
    PAGINATED: (page, size) => buildApiUrl(`/events?page=${page}&size=${size}`),
  },
  PROJECTS: {
    ALL: buildApiUrl("/projects"),
    LIST: buildApiUrl("/projects"),
    DETAIL: (id) => buildApiUrl(`/projects/${id}`),
    CATEGORIES: buildApiUrl("/projects/categories"),
    SUBMIT: buildApiUrl("/projects"),
    UPVOTE: (id) => buildApiUrl(`/projects/${id}/upvote`),
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
    PROFILE: buildApiUrl("/users/profile"),
    ACHIEVEMENTS: buildApiUrl("/users/achievements"),
  },
  SESSION_RECOVERY: {
    BASE: buildApiUrl("/session-recovery"),
    SESSION: (sessionId) =>
      buildApiUrl(`/session-recovery/${encodeURIComponent(sessionId)}`),
    RESTORE: (sessionId) =>
      buildApiUrl(`/session-recovery/${encodeURIComponent(sessionId)}/restore`),
    CLEANUP_EXPIRED: buildApiUrl("/session-recovery/expired"),
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
    EMAIL: (email) => buildApiUrl(`/validate/email/${encodeURIComponent(email)}`),
    USERNAME: (username) => buildApiUrl(`/validate/username/${encodeURIComponent(username)}`),
    PHONE: buildApiUrl("/validate/phone"),
    CONTACT: buildApiUrl("/contact"),
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
      { status, isTimeout: true },
    );
  }

  if (!error.response) {
    return new ApiError(
      error.message || `Network error: ${config.method?.toUpperCase()} ${config.url}`,
      { status, isNetworkError: true },
    );
  }

  if (status === 429) {
    return new RateLimitError(
      error.response?.data?.message || "Too many requests, please try again later.",
      { status, data: error.response?.data || null },
    );
  }

  return new ApiError(
    error.response?.data?.message || error.message || `Request failed with status ${status}`,
    { status, data: error.response?.data || null },
  );
};

const buildAxiosConfig = (url, options = {}) => {
  const { signal, headers, ...rest } = options;
  const config = normalizeRequestConfig(rest);
  if (signal) config.signal = signal;
  if (headers) config.headers = { ...config.headers, ...headers };
  return { url, config };
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

export { normalizeApiError };

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
