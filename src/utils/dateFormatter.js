import { getUserTimezone } from './timezoneUtils';

/**
 * Formats a date string for display in the user's local timezone.
 * * @param {string|Date} date - ISO date string or Date object.
 * @param {Object} [options] - Configuration for formatting.
 * @param {string} [options.timezone] - Override the default timezone.
 * @param {string} [options.locale] - Locale string (e.g., 'en-US').
 * @param {string} [options.format="medium"] - "full", "long", "medium", or "short".
 * @returns {string} The formatted date string.
 * * @example
 * formatEventDate('2026-06-12T10:00:00Z', { format: 'long' }); // "June 12, 2026, 10:00 AM GMT"
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
      default:
        break;
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(d);
  } catch {
    // Fallback for environments without Intl support
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString();
  }
}

/**
 * Formats a date range (start - end) for event display.
 * * @param {string|Date} start - The start date.
 * @param {string|Date} end - The end date.
 * @param {Object} [options] - Configuration for formatting (same as formatEventDate).
 * @returns {string} The formatted date range string.
 * * @example
 * formatEventDateRange('2026-06-12T10:00:00Z', '2026-06-12T12:00:00Z'); // "Jun 12, 2026, 10:00 AM - 12:00 PM"
 */
export function formatEventDateRange(start, end, options = {}) {
  const startStr = formatEventDate(start, { ...options, format: "medium" });
  const endStr = formatEventDate(end, { ...options, format: "short" });
  return `${startStr} - ${endStr}`;
}

/**
 * Returns a relative time string (e.g., "in 3 days", "2 hours ago").
 * * @param {string|Date} date - The target date to calculate relative time from.
 * @returns {string} The relative time string.
 * * @example
 * getRelativeTime('2026-06-12T14:00:00Z'); // "in 1 day"
 */
export function getRelativeTime(date) {
  try {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHr / 24);

    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

    if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, "day");
    if (Math.abs(diffHr) >= 1) return rtf.format(diffHr, "hour");
    if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, "minute");
    return rtf.format(diffSec, "second");
  } catch {
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  }
}
