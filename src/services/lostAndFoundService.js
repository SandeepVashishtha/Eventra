import { apiUtils, API_ENDPOINTS } from "config/api";

const buildApiUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
};

const LOST_AND_FOUND_ENDPOINTS = {
  GET_ALL: (eventId) => buildApiUrl(`/api/events/${eventId}/lost-items`),
  GET_UNCLAIMED: (eventId) => buildApiUrl(`/api/events/${eventId}/lost-items/unclaimed`),
  GET_BY_ID: (eventId, itemId) => buildApiUrl(`/api/events/${eventId}/lost-items/${itemId}`),
  GET_BY_TAG: (eventId, tag) => buildApiUrl(`/api/events/${eventId}/lost-items/tag/${tag}`),
  GET_BY_CATEGORY: (eventId, category) => buildApiUrl(`/api/events/${eventId}/lost-items/category/${category}`),
  SEARCH: (eventId) => buildApiUrl(`/api/events/${eventId}/lost-items/search`),
  COUNT: (eventId) => buildApiUrl(`/api/events/${eventId}/lost-items/count`),
  CREATE: (eventId) => buildApiUrl(`/api/events/${eventId}/lost-items`),
  UPDATE: (eventId, itemId) => buildApiUrl(`/api/events/${eventId}/lost-items/${itemId}`),
  CLAIM: (eventId, itemId) => buildApiUrl(`/api/events/${eventId}/lost-items/${itemId}/claim`),
  DELETE: (eventId, itemId) => buildApiUrl(`/api/events/${eventId}/lost-items/${itemId}`),
};

export const lostAndFoundService = {
  // Get all lost items for an event
  getAllLostItems: async (eventId) => {
    try {
      const response = await apiUtils.get(LOST_AND_FOUND_ENDPOINTS.GET_ALL(eventId));
      return response.data || [];
    } catch (error) {
      console.error("Error fetching all lost items:", error);
      throw error;
    }
  },

  // Get unclaimed lost items for an event
  getUnclaimedLostItems: async (eventId) => {
    try {
      const response = await apiUtils.get(LOST_AND_FOUND_ENDPOINTS.GET_UNCLAIMED(eventId));
      return response.data || [];
    } catch (error) {
      console.error("Error fetching unclaimed lost items:", error);
      throw error;
    }
  },

  // Get a specific lost item by ID
  getLostItemById: async (eventId, itemId) => {
    try {
      const response = await apiUtils.get(LOST_AND_FOUND_ENDPOINTS.GET_BY_ID(eventId, itemId));
      return response.data;
    } catch (error) {
      console.error("Error fetching lost item by ID:", error);
      throw error;
    }
  },

  // Get lost items by AI tag
  getLostItemsByTag: async (eventId, tag) => {
    try {
      const response = await apiUtils.get(LOST_AND_FOUND_ENDPOINTS.GET_BY_TAG(eventId, tag));
      return response.data || [];
    } catch (error) {
      console.error("Error fetching lost items by tag:", error);
      throw error;
    }
  },

  // Get lost items by category
  getLostItemsByCategory: async (eventId, category) => {
    try {
      const response = await apiUtils.get(LOST_AND_FOUND_ENDPOINTS.GET_BY_CATEGORY(eventId, category));
      return response.data || [];
    } catch (error) {
      console.error("Error fetching lost items by category:", error);
      throw error;
    }
  },

  // Search lost items by keyword
  searchLostItems: async (eventId, query) => {
    try {
      const response = await apiUtils.get(LOST_AND_FOUND_ENDPOINTS.SEARCH(eventId), {
        params: { q: query }
      });
      return response.data || [];
    } catch (error) {
      console.error("Error searching lost items:", error);
      throw error;
    }
  },

  // Get count of lost items for an event
  getLostItemCount: async (eventId) => {
    try {
      const response = await apiUtils.get(LOST_AND_FOUND_ENDPOINTS.COUNT(eventId));
      return response.data || { total: 0, unclaimed: 0 };
    } catch (error) {
      console.error("Error fetching lost item count:", error);
      throw error;
    }
  },

  // Create a new lost item
  createLostItem: async (eventId, lostItemData) => {
    try {
      const response = await apiUtils.post(
        LOST_AND_FOUND_ENDPOINTS.CREATE(eventId),
        lostItemData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating lost item:", error);
      throw error;
    }
  },

  // Update a lost item
  updateLostItem: async (eventId, itemId, lostItemData) => {
    try {
      const response = await apiUtils.put(
        LOST_AND_FOUND_ENDPOINTS.UPDATE(eventId, itemId),
        lostItemData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating lost item:", error);
      throw error;
    }
  },

  // Mark a lost item as claimed
  claimLostItem: async (eventId, itemId) => {
    try {
      const response = await apiUtils.post(
        LOST_AND_FOUND_ENDPOINTS.CLAIM(eventId, itemId)
      );
      return response.data;
    } catch (error) {
      console.error("Error claiming lost item:", error);
      throw error;
    }
  },

  // Delete a lost item
  deleteLostItem: async (eventId, itemId) => {
    try {
      const response = await apiUtils.delete(
        LOST_AND_FOUND_ENDPOINTS.DELETE(eventId, itemId)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting lost item:", error);
      throw error;
    }
  },

  // Upload an image and get a persisted URL via the attachments upload endpoint
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiUtils.post("/api/attachments/upload", formData);
    const text = await response.text();
    const link = text.replace("File uploaded to: ", "").trim();
    return { imageUrl: link, thumbnailUrl: link };
  }
};

export default lostAndFoundService;