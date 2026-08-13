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
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs < 0) {
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
 * Parses a date input (string, Date, or timestamp) taking into account an optional target IANA timezone.
 * For naive date strings without explicit UTC/offset designators (e.g. "2026-06-15T10:00:00"),
 * it interprets the date/time in the context of targetTimezone and converts it to a UTC Date instance.
 *
 * @param {string|Date|number} dateInput - Source date input
 * @param {string} [targetTimezone] - Target IANA timezone
 * @returns {Date} Timezone-aware Date object
 */
export function parseDateInTimezone(dateInput, targetTimezone) {
  if (dateInput === null || dateInput === undefined || dateInput === "") {
    return new Date(NaN);
  }

  if (dateInput instanceof Date) {
    return dateInput;
  }

  if (typeof dateInput === "number") {
    return new Date(dateInput);
  }

  if (typeof dateInput === "string") {
    const cleanStr = dateInput.trim();
    if (!cleanStr) return new Date(NaN);

    // If string carries explicit UTC ("Z") or offset ("+05:30" / "-04:00"), standard Date parser handles it
    if (/Z$|[+-]\d{2}:?\d{2}$/i.test(cleanStr)) {
      return new Date(cleanStr);
    }

    // Try matching ISO-like naive date-time string (e.g. "2026-06-15T10:00:00", "2026-06-15 10:00", "2026-06-15")
    const match = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const hours = match[4] ? parseInt(match[4], 10) : 0;
      const minutes = match[5] ? parseInt(match[5], 10) : 0;
      const seconds = match[6] ? parseInt(match[6], 10) : 0;

      const tz = targetTimezone && isValidTimezone(targetTimezone) ? targetTimezone : getUserTimezone();
      const targetLocalMs = Date.UTC(year, month, day, hours, minutes, seconds);

      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        let utcCandidate = targetLocalMs;
        for (let i = 0; i < 4; i++) {
          const parts = Object.fromEntries(
            formatter.formatToParts(new Date(utcCandidate)).map((p) => [p.type, p.value])
          );

          const tzYear = parseInt(parts.year, 10);
          const tzMonth = parseInt(parts.month, 10) - 1;
          const tzDay = parseInt(parts.day, 10);
          const tzHour = parseInt(parts.hour, 10) % 24;
          const tzMinute = parseInt(parts.minute, 10);
          const tzSecond = parseInt(parts.second, 10);

          const formattedLocalMs = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond);
          const delta = targetLocalMs - formattedLocalMs;

          if (delta === 0) return new Date(utcCandidate);
          utcCandidate += delta;
        }

        return new Date(utcCandidate);
      } catch {
        return new Date(targetLocalMs);
      }
    }

    // Fallback for non-standard string formats
    return new Date(cleanStr);
  }

  return new Date(dateInput);
}

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
 * @param {string} [event.timezone] - Timezone of the event
 * @param {string} [event.timeZone] - Alternative key for event timezone
 * @returns {string} Google Calendar Add-Event URL
 */
export function generateGoogleCalendarUrl(event = {}) {
  const {
    title = "",
    startDate,
    endDate,
    description = "",
    location = "",
    timezone,
    timeZone,
  } = event;

  const tz = timezone || timeZone || getUserTimezone();
  const start = parseDateInTimezone(startDate, tz);
  const end = parseDateInTimezone(endDate, tz);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const datesParam = `${toCalendarISOString(start)}/${toCalendarISOString(end)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: datesParam,
    details: description,
    location: location,
  });

  if (tz && isValidTimezone(tz)) {
    params.set("ctz", tz);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates a downloadable iCalendar (.ics) file data URI for Outlook/Apple Calendar.
 * @param {Object} event - Event details
 * @returns {string} Data URI string containing standard .ics format content
 */
export function generateICalDataUrl(event = {}) {
  const {
    title = "",
    startDate,
    endDate,
    description = "",
    location = "",
    timezone,
    timeZone,
  } = event;

  const tz = timezone || timeZone || getUserTimezone();
  const start = parseDateInTimezone(startDate, tz);
  const end = parseDateInTimezone(endDate, tz);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra//Eventra Calendar Utils//EN",
  ];

  if (tz && isValidTimezone(tz)) {
    icsLines.push(`X-WR-TIMEZONE:${tz}`);
  }

  icsLines.push(
    "BEGIN:VEVENT",
    `UID:${Date.now()}@eventra.app`,
    `DTSTAMP:${toCalendarISOString(new Date())}`,
    `DTSTART:${toCalendarISOString(start)}`,
    `DTEND:${toCalendarISOString(end)}`,
    `SUMMARY:${title.replace(/\n/g, "\\n")}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  );

  const icsContent = icsLines.join("\r\n");

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