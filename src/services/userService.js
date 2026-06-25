import { apiUtils, API_ENDPOINTS } from "../config/api";

export const userService = {
  getProfile: async (config) => {
    return apiUtils.get(API_ENDPOINTS.USERS.PROFILE, config);
  },

  updateProfile: async (profileData, config) => {
    return apiUtils.put(API_ENDPOINTS.USERS.PROFILE, profileData, config);
  },
};
