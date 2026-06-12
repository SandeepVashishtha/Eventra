/**
 * @fileoverview calendarUrlUtils.js
 * @module utils/calendarUrlUtils
 *
 * Centralized utility functions for generating calendar-specific redirection links
 * (Google Calendar, Outlook Live, Yahoo Calendar) and generic iCalendar (.ics) files.
 *
 * All generation methods correctly calculate DST offsets and timezones using
 * timezoneUtils.js to ensure time correctness.
 */

import { parseEventToUTC, getUserTimezone } from "./timezoneUtils.js";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert a UTC epoch timestamp to a calendar-compatible date-time string.
 *
 * @param {number} utcMs  - UTC epoch milliseconds
 * @param {'compact'|'iso'} mode
 *   - 'compact' → "YYYYMMDDTHHmmssZ"  (Google Calendar `dates` param)
 *   - 'iso'     → "YYYY-MM-DDTHH:mm:ss" (Outlook startdt/enddt param)
 * @returns {string} Formatted date-time string.
 */
const formatUTCtoCalendarString = (utcMs, mode = "compact") => {
  const d = new Date(utcMs);

  // Pad a number to at least 2 digits
  const pad = (n) => String(n).padStart(2, "0");

  // Extract UTC components (we are already in UTC, so no tz offset needed)
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hour = pad(d.getUTCHours());
  const minute = pad(d.getUTCMinutes());
  const second = pad(d.getUTCSeconds());

  if (mode === "iso") {
    // "YYYY-MM-DDTHH:mm:ss" — no trailing Z; Outlook interprets it as UTC
    // when passed alongside the timezone-neutral startdt param.
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  // Compact: "YYYYMMDDTHHmmssZ"
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
};

/**
 * Convert a local event time to { startMs, endMs } in UTC epoch ms.
 *
 * Falls back gracefully to a naive UTC interpretation (assumes UTC) when
 * timezone detection fails — better than producing a wildly wrong timestamp.
 *
 * @param {object} event  - Event object with .date, .time, .durationMinutes
 * @param {string} [timezone]  - IANA timezone string; defaults to getUserTimezone()
 * @returns {{ startMs: number, endMs: number } | null}
 *   Returns null when date/time are unparseable.
 */
const getEventUTCRange = (event, timezone) => {
  if (!event || typeof event !== "object") {
    console.error("[getEventUTCRange] Invalid event argument: must be an object.");
    return null;
  }

  if (!event.date || !event.time) {
    console.warn(
      "[getEventUTCRange] Missing required event fields: 'date' and 'time' are mandatory."
    );
    return null;
  }

  // Fallback to detected browser timezone if none provided
  const tz = timezone || getUserTimezone();

  // parseEventToUTC handles all date formats (ISO, YYYY-MM-DD, Month DD YYYY)
  // and 12h/24h time strings, with DST-correct conversion via Intl.DateTimeFormat.
  const startMs = parseEventToUTC(event.date, event.time, tz);
  if (startMs === null || isNaN(startMs)) {
    console.warn(
      `[getEventUTCRange] Date '${event.date}' or time '${event.time}' could not be parsed.`
    );
    return null;
  }

  // Defensive validation of durationMinutes: fallback to 60 if missing, negative, or invalid
  let durationMinutes = parseInt(event.durationMinutes, 10);
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    durationMinutes = 60;
  }

  const durationMs = durationMinutes * 60 * 1000;

  return { startMs, endMs: startMs + durationMs };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a Google Calendar "Add to Calendar" URL for the given event.
 *
 * The resulting URL opens Google Calendar's event creation dialog pre-filled
 * with the event title, description, location, and the CORRECT start/end
 * timestamps in UTC.
 *
 * @param {object} event  - Event object
 * @param {string} [timezone]  - IANA tz string; defaults to browser timezone
 * @returns {string}  A fully encoded Google Calendar URL, or "" on error.
 */
export const getGoogleCalendarUrl = (event, timezone) => {
  if (!event) return "";

  const range = getEventUTCRange(event, timezone);

  // Fall back to a best-effort date-only URL when time parsing fails
  if (!range) {
    const dateFallback = String(event.date || "").replace(/-/g, "");
    return [
      "https://calendar.google.com/calendar/render?action=TEMPLATE",
      `&text=${encodeURIComponent(event.title || "")}`,
      `&dates=${dateFallback}T000000Z/${dateFallback}T010000Z`,
      `&details=${encodeURIComponent(event.description || "")}`,
      `&location=${encodeURIComponent(event.location || "")}`,
    ].join("");
  }

  const start = formatUTCtoCalendarString(range.startMs, "compact");
  const end = formatUTCtoCalendarString(range.endMs, "compact");

  return [
    "https://calendar.google.com/calendar/render?action=TEMPLATE",
    `&text=${encodeURIComponent(event.title || "")}`,
    `&dates=${start}/${end}`,
    `&details=${encodeURIComponent(event.description || "")}`,
    `&location=${encodeURIComponent(event.location || "")}`,
  ].join("");
};

/**
 * Build an Outlook Live "Add to Calendar" URL for the given event.
 *
 * @param {object} event  - Event object
 * @param {string} [timezone]  - IANA tz string; defaults to browser timezone
 * @returns {string}  A fully encoded Outlook Live URL, or "" on error.
 */
export const getOutlookCalendarUrl = (event, timezone) => {
  if (!event) return "";

  const range = getEventUTCRange(event, timezone);

  if (!range) {
    const dateFallback = String(event.date || "").replace(/-/g, "");
    return [
      "https://outlook.live.com/calendar/0/deeplink/compose",
      "?path=/calendar/action/compose&rru=addevent",
      `&subject=${encodeURIComponent(event.title || "")}`,
      `&startdt=${dateFallback}T000000`,
      `&enddt=${dateFallback}T010000`,
      `&body=${encodeURIComponent(event.description || "")}`,
      `&location=${encodeURIComponent(event.location || "")}`,
    ].join("");
  }

  const start = formatUTCtoCalendarString(range.startMs, "iso");
  const end = formatUTCtoCalendarString(range.endMs, "iso");

  return [
    "https://outlook.live.com/calendar/0/deeplink/compose",
    "?path=/calendar/action/compose&rru=addevent",
    `&subject=${encodeURIComponent(event.title || "")}`,
    `&startdt=${start}`,
    `&enddt=${end}`,
    `&body=${encodeURIComponent(event.description || "")}`,
    `&location=${encodeURIComponent(event.location || "")}`,
  ].join("");
};

/**
 * Extracts a virtual meeting link (Zoom, Teams, Google Meet) from a text string.
 *
 * @param {string} text - The event description or location string
 * @returns {string|null} - The URL if found, else null
 */
export const extractMeetingLink = (text = "") => {
  if (typeof text !== "string") return null;
  const match = text.match(
    /https:\/\/(us02web\.zoom\.us|teams\.microsoft\.com|meet\.google\.com)\/[^\s]+/i
  );
  return match ? match[0] : null;
};

/**
 * Build a Yahoo Calendar "Add to Calendar" URL for the given event.
 *
 * @param {object} event  - Event object
 * @param {string} [timezone]  - IANA tz string; defaults to browser timezone
 * @returns {string}  A fully encoded Yahoo Calendar URL, or "" on error.
 */
export const getYahooCalendarUrl = (event, timezone) => {
  if (!event) return "";

  const range = getEventUTCRange(event, timezone);

  if (!range) {
    const dateFallback = String(event.date || "").replace(/-/g, "");
    return [
      "https://calendar.yahoo.com/?v=60",
      `&TITLE=${encodeURIComponent(event.title || "")}`,
      `&ST=${dateFallback}T000000Z`,
      `&ET=${dateFallback}T010000Z`,
      `&DESC=${encodeURIComponent(event.description || "")}`,
      `&in_loc=${encodeURIComponent(event.location || "")}`,
    ].join("");
  }

  const start = formatUTCtoCalendarString(range.startMs, "compact");
  const end = formatUTCtoCalendarString(range.endMs, "compact");

  return [
    "https://calendar.yahoo.com/?v=60",
    `&TITLE=${encodeURIComponent(event.title || "")}`,
    `&ST=${start}`,
    `&ET=${end}`,
    `&DESC=${encodeURIComponent(event.description || "")}`,
    `&in_loc=${encodeURIComponent(event.location || "")}`,
  ].join("");
};

/**
 * Generate a standard .ics file Blob URL for Apple Calendar / generic clients.
 *
 * @param {object} event  - Event object
 * @param {string} [timezone]  - IANA tz string; defaults to browser timezone
 * @returns {string|null}  A Blob URL that can be used in an <a href> tag with download attribute. Returns null on error.
 */
export const generateIcsFileBlobUrl = (event, timezone) => {
  if (!event) return null;

  const range = getEventUTCRange(event, timezone);
  let start, end;

  if (!range) {
    const dateFallback = String(event.date || "").replace(/-/g, "");
    start = `${dateFallback}T000000Z`;
    end = `${dateFallback}T010000Z`;
  } else {
    start = formatUTCtoCalendarString(range.startMs, "compact");
    end = formatUTCtoCalendarString(range.endMs, "compact");
  }

  const now = new Date().toISOString().replace(/-|:|\.\d+/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id || Math.random().toString(36).substring(2)}@eventra.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${(event.title || "").replace(/,/g, "\\,")}`,
    `DESCRIPTION:${(event.description || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,")}`,
    `LOCATION:${(event.location || "").replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  try {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("[calendarUrlUtils] Failed to generate ICS file blob URL", error);
    return null;
  }
};
