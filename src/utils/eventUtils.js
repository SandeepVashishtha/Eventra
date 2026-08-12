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
  const endDate = asEndOfDay(parseEventDate(event.endDate || event.date));
  const now = new Date();

  if (!startDate) return "upcoming";
  if (now < startDate) return "upcoming";

  // Moment-based, matching the backend's Event.isEventPast(): once the
  // event's start time has passed it is no longer "live" — even when it is
  // still the same calendar day. The old day-granular "live until midnight"
  // kept the registration form enabled for hours after the event started
  // while the server rejected every submission. (#12462)
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

  const status =
    typeof eventOrStatus === "string"
      ? mapStatusKey(eventOrStatus)
      : getEventStatus(eventOrStatus);

  return status === "past" || status === "ended" || status === "cancelled";
};

export const normalizeEvent = (event) => {
  if (!event) return null;

  return {
    ...event,
    status: getEventStatus(event),
  };
};
