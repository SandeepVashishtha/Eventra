import { apiUtils, API_ENDPOINTS } from "../config/api";

export const eventService = {
  getAllEvents: async (page, size) => {
    if (page !== undefined && size !== undefined) {
      return apiUtils.get(API_ENDPOINTS.EVENTS.PAGINATED(page, size));
    }
    return apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
  },
  
  getEventDetails: async (eventId) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId));
  },
  
  createEvent: async (eventData) => {
    return apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
  },
  
  registerForEvent: async (eventId, data = {}) => {
    const endpoint = API_ENDPOINTS.EVENTS.REGISTER ? API_ENDPOINTS.EVENTS.REGISTER(eventId) : undefined;
    if (!endpoint) throw new Error("Register endpoint missing");
    return apiUtils.post(endpoint, data);
  },
  
  getAvailability: async (eventId) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.AVAILABILITY(eventId));
  },
  
  getRegistrants: async (eventId) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.REGISTRANTS(eventId));
  },
  
  waitlistForEvent: async (eventId, data = {}) => {
    return apiUtils.post(`/api/events/${eventId}/waitlist`, data);
  }
};
