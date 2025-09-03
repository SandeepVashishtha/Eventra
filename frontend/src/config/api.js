// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://eventra-backend-dgcae3etebbag8ft.centralindia-01.azurewebsites.net/api' 
    : 'http://localhost:8080/api');

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/signup`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    VERIFY: `${API_BASE_URL}/auth/verify`
  },
  USER: {
    PROFILE: `${API_BASE_URL}/user/profile`,
    EVENTS: `${API_BASE_URL}/user/events`,
    UPDATE: `${API_BASE_URL}/user/update`
  },
  EVENTS: {
    LIST: `${API_BASE_URL}/events`,
    CREATE: `${API_BASE_URL}/events`,
    JOIN: (eventId) => `${API_BASE_URL}/events/${eventId}/join`,
    LEAVE: (eventId) => `${API_BASE_URL}/events/${eventId}/leave`,
    DETAILS: (eventId) => `${API_BASE_URL}/events/${eventId}`
  },
  PROJECTS: {
    LIST: `${API_BASE_URL}/projects/public`,
    PAGINATED: `${API_BASE_URL}/projects/public/paginated`,
    DETAILS: (projectId) => `${API_BASE_URL}/projects/public/${projectId}`,
    CATEGORIES: `${API_BASE_URL}/projects/categories`,
    TOP: `${API_BASE_URL}/projects/public/top`,
    RECENT: `${API_BASE_URL}/projects/public/recent`,
    SUBMIT: `${API_BASE_URL}/projects/submit`,
    MY_PROJECTS: `${API_BASE_URL}/projects/mine`
  },
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    USERS: `${API_BASE_URL}/admin/users`,
    EVENTS: `${API_BASE_URL}/admin/events`
  }
};

// Helper function to get authorization headers
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': token ? `Bearer ${token}` : undefined
});

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
  }
};

export default API_BASE_URL;
