// API Configuration
// Uses relative paths in development so the CRA proxy (package.json "proxy" field)
// forwards requests to the backend — no CORS issues.
// In production, REACT_APP_API_URL should be set to the backend base URL.
const API_BASE_PATH = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : '';

const AUTH_API_BASE_PATH = `${API_BASE_PATH}/api/auth`;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_API_BASE_PATH}/login`,
    REGISTER: `${AUTH_API_BASE_PATH}/signup`,
  },
  ADMIN: {
    USERS: `${API_BASE_PATH}/api/admin/users`,
    EVENTS: `${API_BASE_PATH}/api/admin/events`,
  },
  ANALYTICS: {
    GET: `${API_BASE_PATH}/api/analytics`,
  },
  PROJECTS: {
    LIST: `${API_BASE_PATH}/api/projects`,
    CATEGORIES: `${API_BASE_PATH}/api/projects/categories`,
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
  get: async (url, token = null) => {
    try {
      console.log('Making GET request to:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });
      return response;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },
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
};


