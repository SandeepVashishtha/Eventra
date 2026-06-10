/**
 * calendarUrlUtils.js
 *
 * Timezone-aware, duration-aware helpers for generating "Add to Calendar"
 * URLs for Google Calendar and Outlook.
 *
 * Problems fixed (see issue #XXXX):
 *
 *  1. TIMEZONE BLINDNESS — The previous formatDateForGoogle() treated event
 *     local times as if they were already UTC (appended a `Z` suffix without
 *     any conversion). A user in IST (UTC+5:30) registering a 10:00 AM event
 *     would get a Google Calendar entry at 10:00 AM UTC — 5 h 30 min later
 *     than the actual event time.
 *
 *     Fix: Convert the local event time to a true UTC timestamp using
 *     parseEventToUTC() from timezoneUtils.js (the same helper already used
 *     by conflictDetection.js), then format with Intl.DateTimeFormat so DST
 *     transitions are handled correctly.
 *
 *  2. HARDCODED 1-HOUR DURATION — Both calendar URL builders computed the end
 *     time as `(startHour + 1) % 24`, completely ignoring event.durationMinutes.
 *     A 3-hour workshop would be shown as a 1-hour event in the calendar.
 *
 *     Fix: Read event.durationMinutes; fall back to 60 min only when absent.
 *
 *  3. CODE DUPLICATION — The same substring-based formatting logic was copied
 *     verbatim into both getGoogleCalendarUrl() and getOutlookCalendarUrl().
 *
 *     Fix: Extract into a single formatUTCtoCalendarString() helper used by
 *     both builders, with separate `compact` (Google) and `iso` (Outlook)
 *     output modes.
 */

import { parseEventToUTC, getUserTimezone } from './timezoneUtils';

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
 * @returns {string}
 */
const formatUTCtoCalendarString = (utcMs, mode = 'compact') => {
  const d = new Date(utcMs);

  // Pad a number to at least 2 digits
  const pad = (n) => String(n).padStart(2, '0');

  // Extract UTC components (we are already in UTC, so no tz offset needed)
  const year   = d.getUTCFullYear();
  const month  = pad(d.getUTCMonth() + 1);
  const day    = pad(d.getUTCDate());
  const hour   = pad(d.getUTCHours());
  const minute = pad(d.getUTCMinutes());
  const second = pad(d.getUTCSeconds());

  if (mode === 'iso') {
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
  if (!event?.date || !event?.time) return null;

  const tz = timezone || getUserTimezone();

  // parseEventToUTC handles all date formats (ISO, YYYY-MM-DD, Month DD YYYY)
  // and 12h/24h time strings, with DST-correct conversion via Intl.DateTimeFormat.
  const startMs = parseEventToUTC(event.date, event.time, tz);
  if (startMs === null) return null;

  // Use the event's own durationMinutes when present; default to 60 min.
  const durationMs = (event.durationMinutes > 0 ? event.durationMinutes : 60) * 60 * 1000;

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
  if (!event) return '';

  const range = getEventUTCRange(event, timezone);

  // Fall back to a best-effort date-only URL when time parsing fails
  if (!range) {
    const dateFallback = (event.date || '').replace(/-/g, '');
    return [
      'https://calendar.google.com/calendar/render?action=TEMPLATE',
      `&text=${encodeURIComponent(event.title || '')}`,
      `&dates=${dateFallback}T000000Z/${dateFallback}T010000Z`,
      `&details=${encodeURIComponent(event.description || '')}`,
      `&location=${encodeURIComponent(event.location || '')}`,
    ].join('');
  }

  const start = formatUTCtoCalendarString(range.startMs, 'compact');
  const end   = formatUTCtoCalendarString(range.endMs,   'compact');

  return [
    'https://calendar.google.com/calendar/render?action=TEMPLATE',
    `&text=${encodeURIComponent(event.title || '')}`,
    `&dates=${start}/${end}`,
    `&details=${encodeURIComponent(event.description || '')}`,
    `&location=${encodeURIComponent(event.location || '')}`,
  ].join('');
};

/**
 * Build an Outlook Live "Add to Calendar" URL for the given event.
 *
 * @param {object} event  - Event object
 * @param {string} [timezone]  - IANA tz string; defaults to browser timezone
 * @returns {string}  A fully encoded Outlook Live URL, or "" on error.
 */
export const getOutlookCalendarUrl = (event, timezone) => {
  if (!event) return '';

  const range = getEventUTCRange(event, timezone);

  if (!range) {
    const dateFallback = (event.date || '').replace(/-/g, '');
    return [
      'https://outlook.live.com/calendar/0/deeplink/compose',
      '?path=/calendar/action/compose&rru=addevent',
      `&subject=${encodeURIComponent(event.title || '')}`,
      `&startdt=${dateFallback}T000000`,
      `&enddt=${dateFallback}T010000`,
      `&body=${encodeURIComponent(event.description || '')}`,
      `&location=${encodeURIComponent(event.location || '')}`,
    ].join('');
  }

  const start = formatUTCtoCalendarString(range.startMs, 'iso');
  const end   = formatUTCtoCalendarString(range.endMs,   'iso');

  return [
    'https://outlook.live.com/calendar/0/deeplink/compose',
    '?path=/calendar/action/compose&rru=addevent',
    `&subject=${encodeURIComponent(event.title || '')}`,
    `&startdt=${start}`,
    `&enddt=${end}`,
    `&body=${encodeURIComponent(event.description || '')}`,
    `&location=${encodeURIComponent(event.location || '')}`,
  ].join('');
};

/**
 * Extracts a virtual meeting link (Zoom, Teams, Google Meet) from a text string.
 *
 * @param {string} text - The event description or location string
 * @returns {string|null} - The URL if found, else null
 */
export const extractMeetingLink = (text = '') => {
  if (typeof text !== 'string') return null;
  const match = text.match(/https:\/\/(us02web\.zoom\.us|teams\.microsoft\.com|meet\.google\.com)\/[^\s]+/i);
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
  if (!event) return '';

  const range = getEventUTCRange(event, timezone);

  if (!range) {
    const dateFallback = (event.date || '').replace(/-/g, '');
    return [
      'https://calendar.yahoo.com/?v=60',
      `&TITLE=${encodeURIComponent(event.title || '')}`,
      `&ST=${dateFallback}T000000Z`,
      `&ET=${dateFallback}T010000Z`,
      `&DESC=${encodeURIComponent(event.description || '')}`,
      `&in_loc=${encodeURIComponent(event.location || '')}`,
    ].join('');
  }

  const start = formatUTCtoCalendarString(range.startMs, 'compact');
  const end   = formatUTCtoCalendarString(range.endMs,   'compact');

  return [
    'https://calendar.yahoo.com/?v=60',
    `&TITLE=${encodeURIComponent(event.title || '')}`,
    `&ST=${start}`,
    `&ET=${end}`,
    `&DESC=${encodeURIComponent(event.description || '')}`,
    `&in_loc=${encodeURIComponent(event.location || '')}`,
  ].join('');
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
    const dateFallback = (event.date || '').replace(/-/g, '');
    start = `${dateFallback}T000000Z`;
    end = `${dateFallback}T010000Z`;
  } else {
    start = formatUTCtoCalendarString(range.startMs, 'compact');
    end = formatUTCtoCalendarString(range.endMs, 'compact');
  }

  const now = new Date().toISOString().replace(/-|:|\.\d+/g, '');
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventra//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id || Math.random().toString(36).substring(2)}@eventra.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${(event.title || '').replace(/,/g, '\\,')}`,
    `DESCRIPTION:${(event.description || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,')}`,
    `LOCATION:${(event.location || '').replace(/,/g, '\\,')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  try {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Failed to generate ICS file blob URL", error);
    return null;
  }
};
