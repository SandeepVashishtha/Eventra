import axios from "axios";
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

setupRequestInterceptor(API, {
  isDev,
  buildApiUrl,
  getAuthToken: () => _authToken,
  getOnUnauthorized: () => onUnauthorized,
});
setupResponseInterceptor(API, {
  isDev,
  timeoutMs: REQUEST_TIMEOUT_MS,
  getOnUnauthorized: () => onUnauthorized,
  getOnRequiresReauth: () => onRequiresReauth,
});

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

/**
 * Normalise the optional config/token argument accepted by apiUtils methods.
 *
 * Authentication is carried automatically via the HttpOnly session cookie
 * (withCredentials: true on the Axios instance).
 */
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
