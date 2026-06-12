const mapStatusKey = (status = "") => {
  if (!status || typeof status !== "string") return "";

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
    "event ended ": "ended",
    cancelled: "cancelled",
    canceled: "cancelled",
    "event cancelled": "cancelled",
    "event canceled": "cancelled",
  };

  return explicitStatusMap[normalized] ?? normalized;
};

import { getServerTime } from "./timeSync";

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

export const computeDateStatus = (event) => {
  const startDate = parseEventDate(event.startDate || event.date);
  const endDate = asEndOfDay(parseEventDate(event.endDate || event.date));
  const now = getServerTime();

  if (!startDate) return "upcoming";
  if (now < startDate) return "upcoming";
  if (endDate && now <= endDate) return "live";
  return "past";
};

export const getEventStatus = (event) => {
  if (!event) return "upcoming";
  const explicitStatus = mapStatusKey(event.status);
  const dateStatus = computeDateStatus(event);

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
  const status =
    typeof eventOrStatus === "string" ? mapStatusKey(eventOrStatus) : getEventStatus(eventOrStatus);

  return status === "past" || status === "ended" || status === "cancelled";
};

export const normalizeEvent = (event) => ({
  ...event,
  status: getEventStatus(event),
});
