import { apiUtils, API_ENDPOINTS } from "../config/api";

const handleError = (error, fallbackMessage) => {
  const message = error.response?.data?.message || error.message || fallbackMessage;
  throw new Error(message);
};

export const validateTicket = async (ticketId, eventId) => {
  try {
    const response = await apiUtils.post(API_ENDPOINTS.TICKETS.VALIDATE, { ticketId, eventId });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to validate ticket");
  }
};

export const recordCheckIn = async (ticketId, eventId, metadata = {}) => {
  try {
    const response = await apiUtils.post(API_ENDPOINTS.TICKETS.CHECK_IN, {
      ticketId,
      eventId,
      ...metadata,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to record check-in");
  }
};

export const fetchCheckInHistory = async (eventId) => {
  try {
    const params = new URLSearchParams();
    if (eventId) params.set("eventId", eventId);
    const query = params.toString() ? `?${params}` : "";
    const response = await apiUtils.get(`${API_ENDPOINTS.TICKETS.HISTORY}${query}`);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to fetch check-in history");
  }
};

export const fetchScannerEvents = async () => {
  try {
    const response = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data.content) return data.content;
    if (data.events) return data.events;
    return [];
  } catch (error) {
    handleError(error, "Failed to fetch events");
  }
};

export const fetchTicketStats = async (eventId) => {
  try {
    const params = new URLSearchParams();
    if (eventId) params.set("eventId", eventId);
    const response = await apiUtils.get(`${API_ENDPOINTS.TICKETS.STATS}?${params}`);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to fetch ticket stats");
  }
};
