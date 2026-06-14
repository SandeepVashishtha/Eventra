import { apiUtils, API_ENDPOINTS } from "../config/api";

const handleError = (error, fallbackMessage) => {
  const message = error.response?.data?.message || error.message || fallbackMessage;
  throw new Error(message);
};

export const fetchAdminUsers = async ({ page = 0, size = 10, search = "" } = {}) => {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);
    if (search) params.set("search", search);
    const response = await apiUtils.get(`${API_ENDPOINTS.ADMIN.USERS}?${params}`);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to fetch users");
  }
};

export const deleteAdminUser = async (userId) => {
  try {
    await apiUtils.delete(API_ENDPOINTS.ADMIN.USER(userId));
  } catch (error) {
    handleError(error, "Failed to delete user");
  }
};

export const updateAdminUser = async (userId, data) => {
  try {
    const response = await apiUtils.put(API_ENDPOINTS.ADMIN.USER(userId), data);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to update user");
  }
};

export const fetchAdminEvents = async ({ page = 0, size = 10, search = "" } = {}) => {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);
    if (search) params.set("search", search);
    const response = await apiUtils.get(`${API_ENDPOINTS.ADMIN.EVENTS}?${params}`);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to fetch events");
  }
};

export const deleteAdminEvent = async (eventId) => {
  try {
    await apiUtils.delete(API_ENDPOINTS.ADMIN.EVENT(eventId));
  } catch (error) {
    handleError(error, "Failed to delete event");
  }
};

export const updateAdminEvent = async (eventId, data) => {
  try {
    const response = await apiUtils.put(API_ENDPOINTS.ADMIN.EVENT(eventId), data);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to update event");
  }
};

export const fetchAdminStats = async () => {
  try {
    const response = await apiUtils.get(API_ENDPOINTS.ADMIN.STATS);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to fetch dashboard stats");
  }
};
