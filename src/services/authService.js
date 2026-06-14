import { apiUtils, API_ENDPOINTS } from "../config/api";

export const authService = {
  login: async (credentials) => {
    return apiUtils.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },
  
  register: async (userData) => {
    const endpoint = API_ENDPOINTS.AUTH.REGISTER || API_ENDPOINTS.AUTH.SIGNUP;
    return apiUtils.post(endpoint, userData);
  },
  
  resetPassword: async (email) => {
    return apiUtils.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  },
  
  logout: async () => {
    return apiUtils.post(API_ENDPOINTS.AUTH.LOGOUT);
  }
};
