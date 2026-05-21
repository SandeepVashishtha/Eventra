import axios from "axios";

// ---------------------------------------------------------------------------
// Base API URL
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

// Axios Instance
const API = axios.create({
  baseURL: BASE_URL,

  headers: {
    "Content-Type":
      "application/json",
  },

  withCredentials: true,
});

// ---------------------------------------------------------------------------
// Global 401 Unauthorized Handler
// ---------------------------------------------------------------------------

let onUnauthorized = null;

/**
 * Register unauthorized callback
 */
export const setOnUnauthorizedHandler =
  (handler) => {
    onUnauthorized = handler;
  };

/**
 * isDev — true only in local development.
 * Used to gate verbose console.debug statements so they don't appear in production builds.
 */
const isDev = process.env.NODE_ENV === 'development';

API.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error?.response
        ?.status === 401
    ) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }

    return Promise.reject(
      error
    );
  }
);

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",

    SIGNUP: "/auth/signup",

    LOGOUT: "/auth/logout",

    RESET_PASSWORD:
      "/auth/reset-password",
  },

  EVENTS: {
    CREATE: "/events/create",

    ALL: "/events",

    DETAIL: (id) =>
      `/events/${id}`,

    REGISTER: (id) =>
      `/events/${id}/register`,
  },

  PROJECTS: {
    ALL: "/projects",

    DETAIL: (id) =>
      `/projects/${id}`,

    CATEGORIES:
      "/projects/categories",

    SUBMIT: "/projects",
  },

  NOTIFICATIONS: {
    ALL: "/notifications",

    READ: (id) =>
      `/notifications/${id}/read`,

    READ_ALL:
      "/notifications/read-all",
  },

  USERS: {
    PROFILE: "/users/profile",

    ACHIEVEMENTS:
      "/users/achievements",
  },
};

// ---------------------------------------------------------------------------
// API Utility Methods
// ---------------------------------------------------------------------------

export const apiUtils = {
  get: (
    url,
    config = {}
  ) =>
    API.get(
      url,
      config
    ),

  post: (
    url,
    data = {},
    config = {}
  ) =>
    API.post(
      url,
      data,
      config
    ),

  put: (
    url,
    data = {},
    config = {}
  ) =>
    API.put(
      url,
      data,
      config
    ),

  patch: (
    url,
    data = {},
    config = {}
  ) =>
    API.patch(
      url,
      data,
      config
    ),

  delete: (
    url,
    config = {}
  ) =>
    API.delete(
      url,
      config
    ),
};

// ---------------------------------------------------------------------------
// Default Export
// ---------------------------------------------------------------------------

export default API;