import { apiUtils, API_ENDPOINTS } from "../config/api";
import { withRateLimit } from "../utils/rateLimiter.js";

export const authService = {
  login: withRateLimit(async (credentials) => {
    return apiUtils.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }, { maxTokens: 5, refillRate: 0.1 }),
  
  register: withRateLimit(async (userData) => {
    const endpoint = API_ENDPOINTS.AUTH.REGISTER || API_ENDPOINTS.AUTH.SIGNUP;
    return apiUtils.post(endpoint, userData);
  }, { maxTokens: 3, refillRate: 0.05 }),
  
  resetPassword: withRateLimit(async (email) => {
    return apiUtils.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  }, { maxTokens: 3, refillRate: 0.05 }),
  
  logout: async () => {
    return apiUtils.post(API_ENDPOINTS.AUTH.LOGOUT);
  }
};
