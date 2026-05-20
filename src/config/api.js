import axios from "axios";

// Base API URL
const BASE_URL =
  process.env
    .REACT_APP_API_URL ||
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

// Unauthorized Handler
let onUnauthorized =
  null;

// Setter
export const setOnUnauthorizedHandler =
  (handler) => {
    onUnauthorized =
      handler;
  };

// Response Interceptor
API.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error?.response
        ?.status === 401
    ) {
      if (
        onUnauthorized
      ) {
        onUnauthorized();
      }
    }

    return Promise.reject(
      error
    );
  }
);

// API Endpoints
export const API_ENDPOINTS =
  {
    AUTH: {
      LOGIN:
        "/auth/login",

      SIGNUP:
        "/auth/signup",

      LOGOUT:
        "/auth/logout",

      RESET_PASSWORD:
        "/auth/reset-password",
    },

    EVENTS: {
      CREATE:
        "/events/create",

      ALL: "/events",
    },

    PROJECTS: {
      ALL: "/projects",
    },

    NOTIFICATIONS: {
      ALL:
        "/notifications",
    },
  };

// API Utility Methods
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

  delete: (
    url,
    config = {}
  ) =>
    API.delete(
      url,
      config
    ),
};

// Default Export
export default API;