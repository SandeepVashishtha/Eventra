// API Configuration
// Uses relative paths in development so the CRA proxy (package.json "proxy" field)
// forwards requests to the backend — no CORS issues.
// In production, REACT_APP_API_URL should be set to the backend base URL.
const AUTH_API_BASE_PATH = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/auth`
  : '/api/auth'; // ← goes through CRA proxy in dev

// fix: shared base URL for all non-auth API routes
const API_BASE_PATH = process.env.REACT_APP_API_URL || '';

// API endpoints — auth, events, projects, notifications, and users
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_API_BASE_PATH}/login`,
    REGISTER: `${AUTH_API_BASE_PATH}/signup`,
  },
  EVENTS: {
    CREATE: `${API_BASE_PATH}/api/events`,
    REGISTER: (id) => `${API_BASE_PATH}/api/events/${id}/register`,
    LIST: `${API_BASE_PATH}/api/events`,
    DETAIL: (id) => `${API_BASE_PATH}/api/events/${id}`,
  },
  PROJECTS: {
    LIST: `${API_BASE_PATH}/api/projects`,
    CATEGORIES: `${API_BASE_PATH}/api/projects/categories`,
    SUBMIT: `${API_BASE_PATH}/api/projects`,
    DETAIL: (id) => `${API_BASE_PATH}/api/projects/${id}`,
  },
  NOTIFICATIONS: {
    BASE: `${API_BASE_PATH}/api/notifications`,
    READ: (id) => `${API_BASE_PATH}/api/notifications/${id}/read`,
    READ_ALL: `${API_BASE_PATH}/api/notifications/read-all`,
  },
  USERS: {
    ACHIEVEMENTS: `${API_BASE_PATH}/api/users/achievements`,
    PROFILE: `${API_BASE_PATH}/api/users/profile`,
  },
};

// Helper function to get authorization headers
export const getAuthHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// ---------------------------------------------------------------------------
// Global 401 Unauthorized handler
// ---------------------------------------------------------------------------
// AuthContext registers a callback here so that any API call receiving a 401
// can trigger a centralized logout + redirect without circular imports.
let _onUnauthorized = null;

/**
 * Register a callback that will be invoked whenever an API response returns
 * HTTP 401 Unauthorized. AuthContext sets this during initialization.
 *
 * @param {Function|null} callback - A function to call on 401 responses, or null to deregister.
 */
export const setOnUnauthorizedHandler = (callback) => {
  _onUnauthorized = callback;
};

/**
 * Process an API response and trigger the unauthorized handler if the
 * server responds with 401, indicating an expired or invalid token.
 *
 * @param {Response} response - The fetch Response object.
 * @returns {Response} The same response (pass-through for chaining).
 */
const handleUnauthorized = (response) => {
  if (response.status === 401 && typeof _onUnauthorized === 'function') {
    _onUnauthorized();
  }
  return response;
};

/**
 * isDev — true only in local development.
 * Used to gate verbose console.debug statements so they don't appear in production builds.
 */
const isDev = process.env.NODE_ENV === 'development';

// API utility functions
export const apiUtils = {
  /**
   * HTTP GET
   * @param {string} url
   * @param {string|null} token - JWT bearer token
   */
  get: async (url, token = null) => {
    try {
      if (isDev) console.debug('[API GET]', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return handleUnauthorized(response);
    } catch (error) {
      console.error('[API GET Error]', url, error);
      throw error;
    }
  },

  /**
   * HTTP POST
   * @param {string} url
   * @param {object} data - Request body
   * @param {string|null} token - JWT bearer token
   */
  post: async (url, data, token = null) => {
    try {
      if (isDev) console.debug('[API POST]', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return handleUnauthorized(response);
    } catch (error) {
      console.error('[API POST Error]', url, error);
      throw error;
    }
  },

  /**
   * HTTP PUT — full resource replacement
   * @param {string} url
   * @param {object} data - Request body
   * @param {string|null} token - JWT bearer token
   */
  put: async (url, data = {}, token = null) => {
    try {
      if (isDev) console.debug('[API PUT]', url);
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return handleUnauthorized(response);
    } catch (error) {
      console.error('[API PUT Error]', url, error);
      throw error;
    }
  },

  /**
   * HTTP PATCH — partial resource update
   * @param {string} url
   * @param {object} data - Partial update body
   * @param {string|null} token - JWT bearer token
   */
  patch: async (url, data = {}, token = null) => {
    try {
      if (isDev) console.debug('[API PATCH]', url);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return handleUnauthorized(response);
    } catch (error) {
      console.error('[API PATCH Error]', url, error);
      throw error;
    }
  },

  /**
   * HTTP DELETE
   * @param {string} url
   * @param {string|null} token - JWT bearer token
   */
  delete: async (url, token = null) => {
    try {
      if (isDev) console.debug('[API DELETE]', url);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      return handleUnauthorized(response);
    } catch (error) {
      console.error('[API DELETE Error]', url, error);
      throw error;
    }
  },
};
