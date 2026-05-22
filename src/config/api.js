import axios from "axios";

// ---------------------------------------------------------------------------
// Base API URL
// ---------------------------------------------------------------------------
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Axios Instance
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for cookie-based auth/session handling
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

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
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