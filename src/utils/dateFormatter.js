/**
 * Advanced Timezone-Aware Date & Event Formatting Engine
 *
 * Provides comprehensive date/time formatting, range formatting, relative duration 
 * calculations, event calendar link generation (iCal/Google), timezone offset 
 * matrix conversions, and recurrence utilities using native Intl APIs.
 */

// ============================================================================
// 1. Timezone Resolution & Validation Helpers
// ============================================================================

/**
 * Gets the user's local IANA timezone string from the browser runtime environment.
 * @returns {string} IANA timezone string (e.g., "America/New_York", "Europe/London")
 */
export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Validates if a provided string is a valid IANA Time Zone name.
 * @param {string} timeZone - IANA timezone candidate string
 * @returns {boolean} True if valid IANA timezone
 */
export function isValidTimezone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the current UTC offset string for a given timezone (e.g., "+05:30", "-05:00").
 * @param {string} [timeZone] - Target IANA timezone name
 * @param {Date} [date=new Date()] - Reference date for daylight saving calculations
 * @returns {string} Offset string formatted as "+HH:MM" or "-HH:MM"
 */
export function getTimezoneOffset(timeZone = getUserTimezone(), date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (!tzPart) return "+00:00";
    const match = tzPart.value.match(/GMT([+-]\d{2}:\d{2})/);
    return match ? match[1] : "+00:00";
  } catch {
    return "+00:00";
  }
}

// ============================================================================
// 2. Comprehensive Date Formatting Utilities
// ============================================================================

/**
 * Formats a date string for display in the target timezone with preset or custom options.
 * @param {string|Date|number} date - ISO date string, timestamp, or Date instance
 * @param {Object} [options] - Formatting configuration options
 * @param {string} [options.timezone] - Target IANA timezone
 * @param {string} [options.locale] - Preferred locale string
 * @param {string} [options.format] - Standard format preset ("full" | "long" | "medium" | "short" | "timeOnly" | "dateOnly")
 * @returns {string} Formatted date string
 */
export function formatEventDate(date, options = {}) {
  try {
    const d = date instanceof Date ? date : new Date(date);

    if (isNaN(d.getTime())) {
      return "Invalid date";
    }

    const timezone = options.timezone || getUserTimezone();
    const locale = options.locale || undefined;
    const format = options.format || "medium";

    const formatOptions = {
      timeZone: timezone,
    };

    switch (format) {
      case "full":
        Object.assign(formatOptions, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "long",
        });
        break;
      case "long":
        Object.assign(formatOptions, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        });
        break;
      case "medium":
        Object.assign(formatOptions, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        break;
      case "short":
        Object.assign(formatOptions, {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        break;
      case "dateOnly":
        Object.assign(formatOptions, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        break;
      case "timeOnly":
        Object.assign(formatOptions, {
          hour: "2-digit",
          minute: "2-digit",
        });
        break;
      default:
        break;
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(d);
  } catch (err) {
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? "Invalid date" : d.toLocaleString();
  }
}

/**
 * Formats a date range (start - end) intelligently using Intl.DateTimeFormat range formatting.
 * @param {string|Date} start - Start date
 * @param {string|Date} end - End date
 * @param {Object} [options] - Configuration options
 * @returns {string} Formatted date range string
 */
export function formatEventDateRange(start, end, options = {}) {
  try {
    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Invalid date range";
    }

    const timezone = options.timezone || getUserTimezone();
    const locale = options.locale || undefined;

    const baseFormatOptions = {
      timeZone: timezone,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    if (options.includeTimezone) {
      baseFormatOptions.timeZoneName = "short";
    }

    const dtf = new Intl.DateTimeFormat(locale, baseFormatOptions);

    if (typeof dtf.formatRange === "function") {
      return dtf.formatRange(startDate, endDate);
    }

    // Fallback if formatRange is unavailable in older engines
    const startStr = formatEventDate(startDate, { ...options, format: "medium" });
    const endStr = formatEventDate(endDate, { ...options, format: "short" });
    return `${startStr} - ${endStr}`;
  } catch {
    return "Invalid date range";
  }
}

// ============================================================================
// 3. Relative Time & Duration Calculations
// ============================================================================

/**
 * Returns a relative human-readable time string (e.g., "in 3 days", "2 hours ago").
 * @param {string|Date} date - Target date
 * @param {Object} [options] - Options for formatting
 * @param {string} [options.locale] - Preferred locale
 * @returns {string} Relative time display
 */
export function getRelativeTime(date, options = {}) {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHr / 24);

    const locale = options.locale || undefined;
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, "day");
    if (Math.abs(diffHr) >= 1) return rtf.format(diffHr, "hour");
    if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, "minute");
    return rtf.format(diffSec, "second");
  } catch {
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  }
}

/**
 * Calculates time remaining (countdown payload) between now and a target event date.
 * @param {string|Date} targetDate - Future event date
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, isPast: boolean }}
 */
export function getTimeRemaining(targetDate) {
  const d = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const now = new Date();

  if (isNaN(d.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isPast: false };
}

/**
 * Formats a duration in milliseconds into a concise human-readable duration (e.g., "2h 30m").
 * @param {number} durationMs - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(durationMs) {
  if (typeof durationMs !== "number" || isNaN(durationMs) || durationMs < 0) {
    return "0m";
  }

  const totalMinutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

// ============================================================================
// 4. Calendar Link Generators (Google Calendar & iCal / ICS)
// ============================================================================

/**
 * Formats a JS Date object into ISO 8601 basic format for calendar integration (YYYYMMDDTHHMMSSZ).
 * @param {Date} date - Source date
 * @returns {string} UTC compact calendar date string
 */
function toCalendarISOString(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

/**
 * Generates a web-intent URL to add an event directly to Google Calendar.
 * @param {Object} event 
 * @param {string} event.title - Event title
 * @param {string|Date} event.startDate - Start time
 * @param {string|Date} event.endDate - End time
 * @param {string} [event.description] - Event details
 * @param {string} [event.location] - Physical or virtual address
 * @returns {string} Google Calendar Add-Event URL
 */
export function generateGoogleCalendarUrl(event = {}) {
  const { title = "", startDate, endDate, description = "", location = "" } = event;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const datesParam = `${toCalendarISOString(start)}/${toCalendarISOString(end)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: datesParam,
    details: description,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates a downloadable iCalendar (.ics) file data URI for Outlook/Apple Calendar.
 * @param {Object} event - Event details
 * @returns {string} Data URI string containing standard .ics format content
 */
export function generateICalDataUrl(event = {}) {
  const { title = "", startDate, endDate, description = "", location = "" } = event;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra//Eventra Calendar Utils//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@eventra.app`,
    `DTSTAMP:${toCalendarISOString(new Date())}`,
    `DTSTART:${toCalendarISOString(start)}`,
    `DTEND:${toCalendarISOString(end)}`,
    `SUMMARY:${title.replace(/\n/g, "\\n")}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
}

// ============================================================================
// 5. Advanced Business Day & Comparison Helpers
// ============================================================================

/**
 * Checks whether a given date falls on a weekend (Saturday or Sunday).
 * @param {string|Date} date - Input date
 * @returns {boolean} True if date is a weekend
 */
export function isWeekend(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Adds a specified number of business days (skipping weekends) to a starting date.
 * @param {string|Date} startDate - Initial date
 * @param {number} days - Business days to add
 * @returns {Date} Resulting date object
 */
export function addBusinessDays(startDate, days) {
  const date = startDate instanceof Date ? new Date(startDate.getTime()) : new Date(startDate);
  if (isNaN(date.getTime()) || typeof days !== "number") return date;

  let added = 0;
  const step = days >= 0 ? 1 : -1;
  const target = Math.abs(days);

  while (added < target) {
    date.setDate(date.getDate() + step);
    if (!isWeekend(date)) {
      added++;
    }
  }

  return date;
}

/**
 * Checks if two dates fall on the exact same calendar day regardless of time.
 * @param {string|Date} dateA 
 * @param {string|Date} dateB 
 * @param {string} [timeZone] - Target timezone for evaluation
 * @returns {boolean} True if same day
 */
export function isSameDay(dateA, dateB, timeZone = getUserTimezone()) {
  try {
    const a = dateA instanceof Date ? dateA : new Date(dateA);
    const b = dateB instanceof Date ? dateB : new Date(dateB);

    if (isNaN(a.getTime()) || isNaN(b.getTime())) return false;

    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    return fmt.format(a) === fmt.format(b);
  } catch {
    return false;
  }
}