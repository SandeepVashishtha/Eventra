import axios from "axios";

// ---------------------------------------------------------------------------
// Base API URL
// ---------------------------------------------------------------------------

const normalizeApiBaseUrl = (value = "") => {
  if (!value) {
    return "";
  }

  const trimmed = value.replace(/\/+$/, "").replace(/\/api$/, "");

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1"
    ) {
      return "";
    }

    return `${parsed.origin}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return /localhost|127\.0\.0\.1|0\.0\.0\.0|::1/i.test(trimmed) ? "" : trimmed;
  }
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

const REQUEST_TIMEOUT_MS = 15_000;
const RETRYABLE_STATUS_CODES = [502, 503, 504];
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1_000;
const isDev = isDevelopment;

// ---------------------------------------------------------------------------
// Normalized API Error
// ---------------------------------------------------------------------------

export class ApiError extends Error {
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
  withCredentials: true,
});

let onUnauthorized = null;

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
        : localStorage.getItem("token") || "";

  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
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
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data),
  };
};

API.interceptors.request.use((config) => {
  if (!config.signal) {
    const controller = new AbortController();
    config.signal = controller.signal;
    config._abortController = controller;
  }

  if (isDev) {
    console.debug(`[API ${config.method?.toUpperCase()}]`, buildApiUrl(config.url || ""));
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error?.response?.status;

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    const retryCount = config._retryCount || 0;
    if (RETRYABLE_STATUS_CODES.includes(status) && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;

      if (isDev) {
        console.debug(
          `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying in ${RETRY_DELAY_MS}ms (attempt ${config._retryCount})...`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return API(config);
    }

    if (
      error.code === "ECONNABORTED" ||
      error.name === "AbortError" ||
      error.message?.includes("timeout")
    ) {
      throw new ApiError(
        `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s: ${config.method?.toUpperCase()} ${config.url}`,
        { isTimeout: true },
      );
    }

    if (!error.response) {
      throw new ApiError(
        error.message || `Network error: ${config.method?.toUpperCase()} ${config.url}`,
        { isNetworkError: true },
      );
    }

    throw new ApiError(
      error.response?.data?.message || error.message || `Request failed with status ${status}`,
      {
        status: error.response.status,
        data: error.response.data,
      },
    );
  },
);

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: buildApiUrl("/api/auth/login"),
    GOOGLE: buildApiUrl("/api/auth/google"),
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

export const apiUtils = {
  get: (url, configOrToken = {}, maybeToken) =>
    API.get(url, normalizeRequestConfig(configOrToken, maybeToken)).then(wrapAxiosResponse),
  post: (url, data = {}, configOrToken = {}, maybeToken) =>
    API.post(url, data, normalizeRequestConfig(configOrToken, maybeToken)).then(wrapAxiosResponse),
  put: (url, data = {}, configOrToken = {}, maybeToken) =>
    API.put(url, data, normalizeRequestConfig(configOrToken, maybeToken)).then(wrapAxiosResponse),
  patch: (url, data = {}, configOrToken = {}, maybeToken) =>
    API.patch(url, data, normalizeRequestConfig(configOrToken, maybeToken)).then(wrapAxiosResponse),
  delete: (url, configOrToken = {}, maybeToken) =>
    API.delete(url, normalizeRequestConfig(configOrToken, maybeToken)).then(wrapAxiosResponse),
};

export default API;
