// API Configuration
// Uses relative paths in development so the CRA proxy (package.json "proxy" field)
// forwards requests to the backend — no CORS issues.
// In production, REACT_APP_API_URL should be set to the backend base URL.
const AUTH_API_BASE_PATH = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/auth`
  : '/api/auth'; // ← goes through CRA proxy in dev

const API_BASE_PATH = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api'; // ← goes through CRA proxy in dev

// API endpoints — only login and signup are active
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_API_BASE_PATH}/login`,
    REGISTER: `${AUTH_API_BASE_PATH}/signup`,
  },
  NOTIFICATIONS: {
    BASE: `${API_BASE_PATH}/notifications`,
    READ: (id) => `${API_BASE_PATH}/notifications/${id}/read`,
  },
  USERS: {
    ACHIEVEMENTS: `${API_BASE_PATH}/users/achievements`,
  }
};

// Helper function to get authorization headers
export const getAuthHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// API utility functions
export const apiUtils = {
  post: async (url, data, token = null) => {
    try {
      console.log('Making POST request to:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },
  get: async (url, token = null) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return response;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },
  put: async (url, data = {}, token = null) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },
  delete: async (url, token = null) => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      return response;
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }
};
