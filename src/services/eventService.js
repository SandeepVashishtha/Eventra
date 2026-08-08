import { apiUtils, API_ENDPOINTS } from "../config/api";

export const eventService = {
  getAllEvents: async (page, size, config = {}) => {
    if (page !== undefined && size !== undefined) {
      return apiUtils.get(API_ENDPOINTS.EVENTS.PAGINATED(page, size), config);
    }
    // Unpaginated callers (home/calendar/conflicts) still hit LIST; request a
    // large first page so they get a usable set under the Page JSON contract.
    return apiUtils.get(`${API_ENDPOINTS.EVENTS.LIST}?page=0&size=100`, config);
  },
  
  getEventDetails: async (eventId, config = {}) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId), config);
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

  getAttendees: async (eventId, config = {}) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.ATTENDEES(eventId), config);
  },
  
  getRegistrants: async (eventId) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.REGISTRANTS(eventId));
  }
};
