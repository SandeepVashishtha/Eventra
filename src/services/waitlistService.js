import { apiUtils, API_ENDPOINTS } from "../config/api";

/**
 * Service to handle event waitlist operations using backend event-scoped endpoints.
 */

export const joinWaitlist = async (eventId) => {
  const response = await apiUtils.post(API_ENDPOINTS.EVENTS.WAITLIST(eventId));
  if (!response.ok) throw new Error("Failed to join waitlist");
  return response.json();
};

export const leaveWaitlist = async (eventId) => {
  const response = await apiUtils.delete(API_ENDPOINTS.EVENTS.WAITLIST(eventId));
  if (!response.ok) throw new Error("Failed to leave waitlist");
  return response.json();
};

export const getWaitlistStatus = async (eventId) => {
  try {
    const response = await apiUtils.get(`${API_ENDPOINTS.EVENTS.WAITLIST(eventId)}/me`);
    if (!response.ok) return { onWaitlist: false, position: null };
    return response.json();
  } catch {
    return { onWaitlist: false, position: null };
  }
};

export const getWaitlistCount = async (eventId) => {
  try {
    const response = await apiUtils.get(API_ENDPOINTS.EVENTS.WAITLIST(eventId));
    if (!response.ok) return { count: 0 };
    const waitlist = await response.json();
    return { count: Array.isArray(waitlist) ? waitlist.length : 0 };
  } catch {
    return { count: 0 };
  }
};
