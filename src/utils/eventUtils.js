/**
 * Event Status Utility Module
 * Handles status normalization, full-day date boundary calculations, and registration guards.
 */

const mapStatusKey = (status = "") => {
  if (!status || typeof status !== "string") return null;

  const normalized = status.trim().toLowerCase();

  const explicitStatusMap = {
    upcoming: "upcoming",
    live: "live",
    "in progress": "live",
    ongoing: "live",
    past: "past",
    completed: "past",
    done: "past",
    ended: "ended",
    "event ended": "ended",
  };

  // 🔥 FIX: Return null for unmapped values instead of echoing the input.
  // Previously an unknown status (e.g. "scheduled", "postponed", or any
  // backend typo) was returned verbatim, and the downstream
  // `if (explicitStatus && explicitStatus !== dateStatus) return explicitStatus`
  // branch then forced that unknown string on the consumer, OVERRIDING the
  // date-derived live/past status. isEventRegistrationClosed only recognised
  // past/ended/cancelled, so any unknown status silently allowed registration
  // on a clearly past event.
  return explicitStatusMap[normalized] ?? null;
};

import { getServerTime } from "./timeSync.js";

const parseEventDate = (dateValue) => {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const asEndOfDay = (date) => {
  if (!date) return null;
  const clone = new Date(date.valueOf());
  clone.setHours(23, 59, 59, 999);
  return clone;
};

export const computeDateStatus = (event = {}) => {
  if (!event) return "upcoming";

  const startDate = parseEventDate(event.startDate || event.date);
  const endDate = asEndOfDay(
    parseEventDate(event.endDate || event.date || event.startDate)
  );
  const now = new Date();

  if (!startDate) return "upcoming";
  if (now < startDate) return "upcoming";

  // Day-granular "live" window, matching the backend LIVE timing filter
  // (EventSpecifications: eventDate between today 00:00 and now). An event
  // that started today is "live"; once its end-of-day boundary passes it
  // becomes "past". (#15450)
  if (endDate && now <= endDate) return "live";
  return "past";
};

export const getEventStatus = (event) => {
  if (!event) return "upcoming";

  const explicitStatus = mapStatusKey(event.status);
  const dateStatus = computeDateStatus(event);

  // 🔥 FIX: explicitStatus is now null (not the raw string) when the backend
  // sends a status the client does not recognise. The falsy check below
  // correctly falls through to the date-derived status in that case.
  if (explicitStatus === "ended") {
    return "ended";
  }

  // A cancelled event must not be overridden by a future date status.
  // Return the explicit cancellation status directly so downstream consumers
  // can block registration regardless of when the event was scheduled.
  if (explicitStatus === "cancelled") {
    return "cancelled";
  }

  if (explicitStatus && explicitStatus !== dateStatus) {
    return explicitStatus;
  }
  return dateStatus || "upcoming";
};

export const isEventRegistrationClosed = (eventOrStatus) => {
  if (!eventOrStatus) return true;

  // Moment-based, matching the backend's Event.isEventPast(): registration
  // closes the moment the event's start time passes — even while the event is
  // still classified "live" for display/filtering. This preserves #12462 while
  // allowing #15450's "live" status. Event objects carry a date; raw status
  // strings (e.g. "live") have none and fall through to the status mapping.
  if (typeof eventOrStatus === "object") {
    const startDate = parseEventDate(
      eventOrStatus.startDate || eventOrStatus.eventDate || eventOrStatus.date
    );
    if (startDate && new Date() >= startDate) return true;
  }

  const status =
    typeof eventOrStatus === "string"
      ? mapStatusKey(eventOrStatus)
      : getEventStatus(eventOrStatus);

  return status === "past" || status === "ended" || status === "cancelled";
};

/**
 * Check if an event has low inventory and should show FOMO badge.
 * FOMO (Fear Of Missing Out) is triggered when remaining tickets drop below 10%
 * of capacity OR below 20 absolute tickets.
 *
 * @param {number} capacity - Total event capacity
 * @param {number} registeredCount - Number of registered participants
 * @returns {Object} Object containing isLowInventory boolean and message string
 */
export const getFomoStatus = (capacity, registeredCount) => {
  if (capacity == null || capacity <= 0) return { isLowInventory: false, message: null };

  const remaining = capacity - (registeredCount ?? 0);
  if (remaining <= 0) return { isLowInventory: false, message: null }; // Event is full, not "selling fast"

  const lowThreshold = Math.max(20, Math.ceil(capacity * 0.1));
  const isLowInventory = remaining <= lowThreshold;

  if (!isLowInventory) return { isLowInventory: false, message: null };

  // Generate appropriate FOMO message
  if (remaining <= 5) {
    return { isLowInventory: true, message: `Only ${remaining} Tickets Left!` };
  }
  return { isLowInventory: true, message: "Selling Fast!" };
};

export const normalizeEvent = (event) => {
  if (!event) return null;

  return {
    ...event,
    status: getEventStatus(event),
  };
};
