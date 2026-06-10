import axios from "axios";
import { ENV } from "./env.js";
import { logger } from "../utils/logger.js";
import { ApiError, RateLimitError, normalizeApiError } from "./api/errors.js";
import {
  setOnUnauthorizedHandler,
  setAuthToken,
  createRequestInterceptor,
  createResponseInterceptor,
} from "./api/interceptors.js";
import { ApiError, RateLimitError } from "./api/errors.js";
import { setupRequestInterceptor, setupResponseInterceptor } from "./api/interceptors.js";

// ---------------------------------------------------------------------------
// Base API URL
// ---------------------------------------------------------------------------

const normalizeApiBaseUrl = (value = "") => {
  if (!value) return "";
  const trimmed = value.replace(/\/+$/, "").replace(/\/api$/, "");
  try {
    const parsed = new URL(trimmed);
    return `${parsed.origin}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return trimmed;
  }
};

const isDev = process.env.NODE_ENV === "development";

// Deployed backend — used when no environment variable overrides it.
// Update this URL if the backend is redeployed to a different host.
const DEPLOYED_BACKEND_URL =
  "https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net";

const resolveEnvApiBaseUrl = () => {
  const envUrl = ENV.API_URL;
  if (envUrl) return normalizeApiBaseUrl(envUrl);
  if (!isDev) {
    logger.warn(`VITE_API_URL missing in ${process.env.NODE_ENV}. Defaulting to relative API requests.`);
    return "";
  }
  return "http://localhost:8080";
  if (envUrl) {
    return normalizeApiBaseUrl(envUrl);
  }
  // No env variable set — fall back to the deployed backend URL.
  return normalizeApiBaseUrl(DEPLOYED_BACKEND_URL);
};

export const API_BASE_URL = resolveEnvApiBaseUrl();

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

API.interceptors.request.use(createRequestInterceptor(isDev));

const { fulfill, reject } = createResponseInterceptor(API);
API.interceptors.response.use(fulfill, reject);

export { setOnUnauthorizedHandler, setAuthToken };

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

const normalizeRequestConfig = (configOrToken = {}) => {
  const config = typeof configOrToken === "string" ? {} : { ...configOrToken };
  if ("skipAuth" in config) delete config.skipAuth;
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

export { ApiError, RateLimitError, normalizeApiError };
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
    SCHEDULE: (id) => buildApiUrl(`/api/events/${id}/schedule`),
    REGISTER: (id) => buildApiUrl(`/api/events/${id}/register`),
    AVAILABILITY: (id) => buildApiUrl(`/api/events/${id}/availability`),
    CANCEL: (id) => buildApiUrl(`/api/events/${id}/cancel`),
    REGISTRANTS: (id) => buildApiUrl(`/api/events/${id}/registrants`),
    PAGINATED: (page, size) => buildApiUrl(`/api/events?page=${page}&size=${size}`),
  },
  PROJECTS: {
    ALL: buildApiUrl("/api/projects"),
    LIST: buildApiUrl("/api/projects"),
    DETAIL: (id) => buildApiUrl(`/api/projects/${id}`),
    CATEGORIES: buildApiUrl("/api/projects/categories"),
    SUBMIT: buildApiUrl("/api/projects"),
  },
  HACKATHONS: {
    LIST: buildApiUrl("/api/hackathons"),
    DETAIL: (id) => buildApiUrl(`/api/hackathons/${id}`),
    HOST: buildApiUrl("/api/hackathons"),
  },
  NOTIFICATIONS: {
    BASE: buildApiUrl("/api/notifications"),
    ALL: buildApiUrl("/api/notifications"),
    READ: (id) => (id ? buildApiUrl(`/api/notifications/${id}/read`) : ""),
    DELETE: (id) => (id ? buildApiUrl(`/api/notifications/${id}`) : ""),
    READ_ALL: buildApiUrl("/api/notifications/read-all"),
    PREFERENCES: buildApiUrl("/api/notifications/preferences"),
    PUSH_SUBSCRIBE: buildApiUrl("/api/notifications/push-subscriptions"),
    PUSH_UNSUBSCRIBE: buildApiUrl("/api/notifications/push-subscriptions/unsubscribe"),
  },
  USERS: {
    PROFILE: buildApiUrl("/api/users/profile"),
    ACHIEVEMENTS: buildApiUrl("/api/users/achievements"),
  },
  SESSION_RECOVERY: {
    BASE: buildApiUrl("/api/session-recovery"),
    SESSION: (sessionId) => buildApiUrl(`/api/session-recovery/${encodeURIComponent(sessionId)}`),
    RESTORE: (sessionId) => buildApiUrl(`/api/session-recovery/${encodeURIComponent(sessionId)}/restore`),
    CLEANUP_EXPIRED: buildApiUrl("/api/session-recovery/expired"),
  },
  TICKETS: {
    VALIDATE: buildApiUrl("/api/tickets/validate"),
    CHECK_IN: buildApiUrl("/api/tickets/checkin"),
    HISTORY: buildApiUrl("/api/tickets/checkins"),
  },
  FEEDBACK: {
    BASE: buildApiUrl("/api/feedback"),
    BY_EVENT: (eventId) => {
      const params = new URLSearchParams({ eventId: String(eventId) });
      return buildApiUrl(`/api/feedback?${params.toString()}`);
    },
  },
  ADMIN: {
    USERS: buildApiUrl("/api/admin/users"),
    USER: (id) => buildApiUrl(`/api/admin/users/${id}`),
    EVENTS: buildApiUrl("/api/admin/events"),
    EVENT: (id) => buildApiUrl(`/api/admin/events/${id}`),
    STATS: buildApiUrl("/api/admin/stats"),
  },
  VALIDATION: {
    EMAIL: (email) => buildApiUrl(`/api/validate/email/${encodeURIComponent(email)}`),
    USERNAME: (username) => buildApiUrl(`/api/validate/username/${encodeURIComponent(username)}`),
    PHONE: buildApiUrl("/api/validate/phone"),
    CONTACT: buildApiUrl("/api/contact"),
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

export const apiConfigCache = {
  store: new Map(),
  get(key) { return this.store.get(key); },
  set(key, val) { this.store.set(key, val); },
  clear() { this.store.clear(); },
};
