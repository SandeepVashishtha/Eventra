/**
 * useDateFormatter.js
 *
 * Reactive date formatting hook that wraps the existing dateFormatter.js
 * utility and provides consistent locale/timezone-aware formatting across
 * the entire application.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * `dateFormatter.js` already exists with `formatEventDate`, `formatEventDateRange`,
 * and `getRelativeTime` — but 81 components bypass it and call
 * `toLocaleDateString()` / `toLocaleTimeString()` directly.
 *
 * Problems with direct `toLocaleDateString()` usage:
 *  1. No timezone support — renders in the browser's local timezone,
 *     which differs from the event's actual timezone
 *  2. Inconsistent locale — "en-US" hardcoded in some places, undefined
 *     in others, causing different output on non-English systems
 *  3. No relative time — components that need "3 days ago" each implement
 *     their own approximation
 *  4. No memoization — `new Date(str).toLocaleDateString(...)` called on
 *     every render instead of being memoized
 *
 * FEATURES
 * --------
 *  1. Wraps `formatEventDate`     — timezone-aware, locale-aware
 *  2. Wraps `formatEventDateRange` — consistent start–end formatting
 *  3. Wraps `getRelativeTime`     — "in 3 days", "2 hours ago" via Intl.RelativeTimeFormat
 *  4. `formatShort`               — "Jun 12" convenience wrapper
 *  5. `formatDate`                — date-only, no time component
 *  6. `isValid`                   — safe date validity check
 *  7. All functions memoized      — stable references, safe in dependency arrays
 *
 * USAGE
 * -----
 *   const { formatEventDate, formatShort, getRelativeTime, isValid } = useDateFormatter();
 *
 *   // Full event date with timezone
 *   formatEventDate(event.date, { format: "long" })
 *   // → "June 12, 2026, 10:00 AM EDT"
 *
 *   // Short display
 *   formatShort(event.date)
 *   // → "Jun 12"
 *
 *   // Relative time
 *   getRelativeTime(event.date)
 *   // → "in 3 days"
 *
 *   // Date only
 *   formatDate(event.date)
 *   // → "June 12, 2026"
 */

import { useCallback } from "react";
import {
  formatEventDate,
  formatEventDateRange,
  getRelativeTime,
} from "utils/dateFormatter";

/**
 * useDateFormatter
 *
 * @param {object} [defaults]
 * @param {string} [defaults.timezone]  Override timezone for all calls
 * @param {string} [defaults.locale]    Override locale for all calls
 *
 * @returns {{
 *   formatEventDate:      (date: string|Date, options?: object) => string,
 *   formatEventDateRange: (start: string|Date, end: string|Date, options?: object) => string,
 *   getRelativeTime:      (date: string|Date) => string,
 *   formatShort:          (date: string|Date) => string,
 *   formatDate:           (date: string|Date) => string,
 *   formatTime:           (date: string|Date) => string,
 *   isValid:              (date: string|Date) => boolean,
 * }}
 */
const useDateFormatter = (defaults = {}) => {
  const { timezone, locale } = defaults;

  /**
   * Format a date with full event context (date + time + timezone).
   * Wraps `formatEventDate` from dateFormatter.js.
   */
  const format = useCallback(
    (date, options = {}) =>
      formatEventDate(date, { timezone, locale, ...options }),
    [timezone, locale]
  );

  /**
   * Format a date range (start – end).
   */
  const formatRange = useCallback(
    (start, end, options = {}) =>
      formatEventDateRange(start, end, { timezone, locale, ...options }),
    [timezone, locale]
  );

  /**
   * Get relative time string ("in 3 days", "2 hours ago").
   */
  const relative = useCallback(
    (date) => getRelativeTime(date),
    []
  );

  /**
   * Short display: "Jun 12" — month + day only, no year or time.
   * Replaces: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
   */
  const formatShort = useCallback(
    (date) => {
      try {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return "—";
        return new Intl.DateTimeFormat(locale ?? "en-US", {
          month: "short",
          day: "numeric",
          timeZone: timezone,
        }).format(d);
      } catch {
        return "—";
      }
    },
    [timezone, locale]
  );

  /**
   * Date only: "June 12, 2026" — no time component.
   * Replaces: new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
   */
  const formatDate = useCallback(
    (date) => {
      try {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return "—";
        return new Intl.DateTimeFormat(locale ?? "en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: timezone,
        }).format(d);
      } catch {
        return "—";
      }
    },
    [timezone, locale]
  );

  /**
   * Time only: "10:00 AM" — no date component.
   * Replaces: new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
   */
  const formatTime = useCallback(
    (date) => {
      try {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return "—";
        return new Intl.DateTimeFormat(locale ?? "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: timezone,
        }).format(d);
      } catch {
        return "—";
      }
    },
    [timezone, locale]
  );

  /**
   * Check whether a date value is valid.
   * Replaces: !isNaN(new Date(date).getTime())
   */
  const isValid = useCallback((date) => {
    if (!date) return false;
    const d = date instanceof Date ? date : new Date(date);
    return !isNaN(d.getTime());
  }, []);

  return {
    formatEventDate: format,
    formatEventDateRange: formatRange,
    getRelativeTime: relative,
    formatShort,
    formatDate,
    formatTime,
    isValid,
  };
};

export default useDateFormatter;
