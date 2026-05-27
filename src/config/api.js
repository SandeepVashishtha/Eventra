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
    return `${parsed.origin}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return trimmed;
  }
};

const isDev = process.env.NODE_ENV === "development";

const resolveEnvApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    return normalizeApiBaseUrl(envUrl);
  }
  if (process.env.NODE_ENV === "production") {
    if (isDev) {
      console.warn("REACT_APP_API_URL environment variable is missing in production. Defaulting to relative API requests.");
    }
    return "";
  }
  return "http://localhost:8080";
};

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

// ---------------------------------------------------------------------------
// Normalized API Error
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    message,
    { status = null, data = null, isTimeout = false, isNetworkError = false } = {}
  ) {
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

const normalizeRequestConfig = (configOrToken = {}) => {
  const config = typeof configOrToken === "string" ? {} : { ...configOrToken };
  
  if ("skipAuth" in config) {
    delete config.skipAuth;
  }
  // With HttpOnly cookies, the browser automatically sends the session cookie.
  // We no longer manually append the Authorization header here.

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
          `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying in ${RETRY_DELAY_MS}ms (attempt ${config._retryCount})...`
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
        { isTimeout: true }
      );
    }

    if (!error.response) {
      throw new ApiError(
        error.message || `Network error: ${config.method?.toUpperCase()} ${config.url}`,
        { isNetworkError: true }
      );
    }

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
    GOOGLE: buildApiUrl("/api/auth/google"),
    REGISTER: buildApiUrl("/api/auth/signup"),
    SIGNUP: buildApiUrl("/api/auth/signup"),
    LOGOUT: buildApiUrl("/api/auth/logout"),
    RESET_PASSWORD: buildApiUrl("/api/auth/reset-password"),
  },
  EVENTS: {
    CREATE: buildApiUrl("/api/events/create"),
    LIST: buildApiUrl("/api/events"),
    DETAIL: (id) => buildApiUrl(`/api/events/${id}`),
    REGISTER: (id) => buildApiUrl(`/api/events/${id}/register`),
  },
  PROJECTS: {
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
    READ: (id) => (id ? buildApiUrl(`/api/notifications/${id}/read`) : ""),
    READ_ALL: buildApiUrl("/api/notifications/read-all"),
  },
  USERS: {
    PROFILE: buildApiUrl("/api/users/profile"),
    ACHIEVEMENTS: buildApiUrl("/api/users/achievements"),
  },
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
};

export default API;

export const API_ENDPOINTS_UPDATED = {
  ...API_ENDPOINTS,
  NOTIFICATIONS: {
    ...API_ENDPOINTS.NOTIFICATIONS,
    READ_ALL: buildApiUrl("/api/notifications/read-all"),
  }
};
