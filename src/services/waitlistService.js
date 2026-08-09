import { apiUtils, API_ENDPOINTS } from "../config/api";

/**
 * Waitlist API helpers.
 * Auth headers, CSRF, credentials, and base URL come from the shared apiUtils
 * client (setAuthToken / interceptors) — do not use process.env or raw fetch.
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

// Backend WaitlistResponse only ever returns entries with status "WAITING"
// from GET /waitlist/me (see EventService#getMyWaitlistEntry), and responds
// with a non-2xx status when the user has no active entry. Map that shape
// into the { onWaitlist, position } contract the UI expects instead of
// looking for a nonexistent `onWaitlist` field on the raw response.
export const getWaitlistStatus = async (eventId) => {
  try {
    const response = await apiUtils.get(`${API_ENDPOINTS.EVENTS.WAITLIST(eventId)}/me`);
    if (!response.ok) return { onWaitlist: false, position: null };
    const data = await response.json();
    return {
      onWaitlist: Boolean(data) && (data.status ? data.status === "WAITING" : true),
      position: data?.position ?? null,
    };
  } catch {
    return { onWaitlist: false, position: null };
  }
};

// GET /events/{id}/waitlist is organizer/admin-only and returns 403 for
// attendees. Rather than swallowing that into a misleading count of 0, treat
// an unknown count (403, or any other failure) as `null` so callers can hide
// the count instead of showing a wrong number.
export const getWaitlistCount = async (eventId) => {
  try {
    const response = await apiUtils.get(API_ENDPOINTS.EVENTS.WAITLIST(eventId));
    if (!response.ok) return { count: null };
    const waitlist = await response.json();
    return { count: Array.isArray(waitlist) ? waitlist.length : null };
  } catch {
    return { count: null };
  }
};
