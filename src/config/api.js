import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://eventra-backend-dgcae3etebbag8ft.centralindia-01.azurewebsites.net";

const REQUEST_TIMEOUT_MS = 15_000;
const RETRYABLE_STATUS_CODES = [502, 503, 504];
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1_000;
const isDev = process.env.NODE_ENV === "development";

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

const API = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (!config.signal) {
      const controller = new AbortController();
      config.signal = controller.signal;
      config._abortController = controller;
    }
    if (isDev) console.debug(`[API ${config.method?.toUpperCase()}]`, config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

let onUnauthorized = null;
export const setOnUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};

    // 401 — centralized handler
    if (error?.response?.status === 401) {
      if (onUnauthorized) onUnauthorized();
      return Promise.reject(error);
    }

    // Retry for transient 5xx
    const retryCount = config._retryCount || 0;
    const status = error?.response?.status;
    if (RETRYABLE_STATUS_CODES.includes(status) && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;
      if (isDev) console.debug(`[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying...`);
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return API(config);
    }

    // Normalize errors
    if (error.code === "ECONNABORTED" || error.name === "AbortError" || error.message?.includes("timeout")) {
      throw new ApiError(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s: ${config.method?.toUpperCase()} ${config.url}`, { isTimeout: true });
    }
    if (!error.response) {
      throw new ApiError(error.message || `Network error: ${config.method?.toUpperCase()} ${config.url}`, { isNetworkError: true });
    }
    throw new ApiError(error.response?.data?.message || error.message || `Request failed with status ${status}`, { status: error.response.status, data: error.response.data });
  }
);

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    REGISTER: "/auth/signup",
    LOGOUT: "/auth/logout",
    RESET_PASSWORD: "/auth/reset-password",
    GOOGLE: "/auth/google",
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
    BASE: "/notifications",
    READ: (id) => `/notifications/${id}/read`,
    READ_ALL: "/notifications/read-all",
  },
  USERS: {
    PROFILE: "/users/profile",
    ACHIEVEMENTS: "/users/achievements",
  },
};

export const apiUtils = {
  get: (url, config = {}) => API.get(url, config),
  post: (url, data = {}, config = {}) => API.post(url, data, config),
  put: (url, data = {}, config = {}) => API.put(url, data, config),
  patch: (url, data = {}, config = {}) => API.patch(url, data, config),
  delete: (url, config = {}) => API.delete(url, config),
};

export default API;
