import { apiUtils, API_ENDPOINTS } from "../config/api";

/**
 * Waitlist API helpers.
 * Auth headers, CSRF, credentials, and base URL come from the shared apiUtils
 * client (setAuthToken / interceptors) — do not use process.env or raw fetch.
 */

export const joinWaitlist = async (eventId) => {
  const response = await apiUtils.post(API_ENDPOINTS.WAITLIST.JOIN(eventId));
  if (!response.ok) throw new Error("Failed to join waitlist");
  return response.json();
};

export const leaveWaitlist = async (eventId) => {
  const response = await apiUtils.delete(API_ENDPOINTS.WAITLIST.LEAVE(eventId));
  if (!response.ok) throw new Error("Failed to leave waitlist");
  return response.json();
};

export const getWaitlistStatus = async (eventId) => {
  try {
    const response = await apiUtils.get(API_ENDPOINTS.WAITLIST.STATUS(eventId));
    if (!response.ok) return { onWaitlist: false, position: null };
    return response.json();
  } catch {
    return { onWaitlist: false, position: null };
  }
};

export const getWaitlistCount = async (eventId) => {
  try {
    const response = await apiUtils.get(API_ENDPOINTS.WAITLIST.COUNT(eventId));
    if (!response.ok) return { count: 0 };
    return response.json();
  } catch {
    return { count: 0 };
  }
};
