// API Configuration - Same-origin base path.
// In development, CRA will proxy /api to the backend (see package.json "proxy").
// In production (Vercel), rewrites will proxy /api to the backend (see vercel.json).
const API_BASE_PATH = '/api';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
  LOGIN: `${API_BASE_PATH}/auth/login`,
  REGISTER: `${API_BASE_PATH}/auth/signup`,
  LOGOUT: `${API_BASE_PATH}/auth/logout`,
  REFRESH: `${API_BASE_PATH}/auth/refresh`,
  VERIFY: `${API_BASE_PATH}/auth/verify`,
   // ✅ New: Google login endpoint
    GOOGLE_LOGIN: `${API_BASE_PATH}/auth/google`
  },
  USER: {
  PROFILE: `${API_BASE_PATH}/user/profile`,
  EVENTS: `${API_BASE_PATH}/user/events`,
  UPDATE: `${API_BASE_PATH}/user/update`
  },
  EVENTS: {
  LIST: `${API_BASE_PATH}/events`,
  CREATE: `${API_BASE_PATH}/events`,
  JOIN: (eventId) => `${API_BASE_PATH}/events/${eventId}/join`,
  LEAVE: (eventId) => `${API_BASE_PATH}/events/${eventId}/leave`,
  DETAILS: (eventId) => `${API_BASE_PATH}/events/${eventId}`,
  REGISTER: (eventId) => `${API_BASE_PATH}/events/${eventId}/register`
  },
  PROJECTS: {
  LIST: `${API_BASE_PATH}/projects/public`,
  PAGINATED: `${API_BASE_PATH}/projects/public/paginated`,
  DETAILS: (projectId) => `${API_BASE_PATH}/projects/public/${projectId}`,
  CATEGORIES: `${API_BASE_PATH}/projects/categories`,
  TOP: `${API_BASE_PATH}/projects/public/top`,
  RECENT: `${API_BASE_PATH}/projects/public/recent`,
  SUBMIT: `${API_BASE_PATH}/projects/submit`,
  MY_PROJECTS: `${API_BASE_PATH}/projects/mine`
  },
  ADMIN: {
  DASHBOARD: `${API_BASE_PATH}/admin/dashboard`,
  USERS: `${API_BASE_PATH}/admin/users`,
  EVENTS: `${API_BASE_PATH}/admin/events`
  }
};

// Helper function to get authorization headers
export const getAuthHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// API utility functions - Simplified without CORS
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
      console.log('Request data:', data);
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

  put: async (url, data, token = null) => {
    try {
      console.log('Making PUT request to:', url);
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  delete: async (url, token = null) => {
    try {
      console.log('Making DELETE request to:', url);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });
      return response;
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
  
// ✅ New: Google Login helper
  googleLogin: async (googleToken) => {
    try {
      console.log('Google Login with token:', googleToken);
      const response = await fetch(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken })
      });
      return response;
    } catch (error) {
      console.error('Google Login API Error:', error);
      throw error;
    }
  }
};

export default API_BASE_PATH;
