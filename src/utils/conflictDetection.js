/**
 * Conflict Detection Utilities
 *
 * Detects scheduling conflicts between events in a timezone-aware manner.
 *
 * Key improvements over the previous implementation:
 *  1. All event date+time fields are parsed to UTC epoch ms via parseEventToUTC()
 *     from timezoneUtils.js — no more "minutes from local midnight" arithmetic.
 *  2. Each event's durationMinutes field is honoured; falls back to 60 min only
 *     when the field is absent or falsy.
 *  3. Date comparison uses real timestamp overlap: !(end1 <= start2 || end2 <= start1)
 *     instead of fragile raw-string equality (event1.date !== event2.date).
 *  4. formatTimeRange() now accepts a timezone argument and renders the time in
 *     the user's local timezone via Intl.DateTimeFormat.
 *
 * Affected issue: #2014
 * See also: src/utils/timezoneUtils.js, src/components/EventConflictModal.jsx
 */

import {
  getUserTimezone,
  parseEventToUTC,
  parseTimeString,
  normalizeDateString,
} from "./timezoneUtils.js";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Return the effective duration (in minutes) for an event.
 * Reads event.durationMinutes first; falls back to the provided default.
 *
 * @param {object} event
 * @param {number} fallbackMinutes
 * @returns {number}
 */
const getEffectiveDuration = (event, fallbackMinutes = 60) => {
  const d = event?.durationMinutes;
  return typeof d === "number" && d > 0 ? d : fallbackMinutes;
};

/**
 * Convert an event to a UTC time-range { startMs, endMs }.
 * Returns null when the event lacks enough date/time data to parse.
 *
 * @param {object} event  - Event object with .date and .time fields
 * @param {number} fallbackDuration  - Minutes to use when event.durationMinutes is absent
 * @param {string} [timezone]  - IANA tz string; defaults to browser's tz
 * @returns {{ startMs: number, endMs: number }|null}
 */
export const getEventUTCRange = (event, fallbackDuration = 60, timezone) => {
  if (!event) return null;

  const tz = event.timezone || event.timeZone || timezone || getUserTimezone();
  const startMs = parseEventToUTC(event.date, event.time, tz);

  if (startMs === null) return null;

  const durationMs = getEffectiveDuration(event, fallbackDuration) * 60 * 1000;
  return { startMs, endMs: startMs + durationMs };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * @deprecated Use getEventUTCRange() instead.
 *
 * Legacy helper preserved for backward-compatibility with callers that still
 * use parseTimeToMinutes(). Does NOT account for timezone or event duration.
 *
 * @param {string} timeStr - "HH:MM AM/PM" or "HH:MM"
 * @returns {number} Minutes from midnight (local, timezone-blind)
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parsed = parseTimeString(timeStr);
  if (!parsed) return 0;
  return parsed.hours * 60 + parsed.minutes;
};

/**
 * @deprecated Use getEventUTCRange() instead.
 *
 * Legacy range helper — timezone-blind, always uses fallback duration.
 *
 * @param {object} event
 * @param {number} durationMinutes
 * @returns {{ startMinutes: number, endMinutes: number }}
 */
export const getEventTimeRange = (event, durationMinutes = 60) => {
  const startMinutes = parseTimeToMinutes(event?.time);
  const endMinutes = startMinutes + getEffectiveDuration(event, durationMinutes);
  return { startMinutes, endMinutes };
};

/**
 * Check whether two events have overlapping time ranges.
 *
 * Uses UTC epoch timestamps so cross-timezone and cross-midnight overlaps are
 * detected correctly. Falls back to the legacy minutes-from-midnight approach
 * only when the date/time fields cannot be parsed.
 *
 * @param {object} event1
 * @param {object} event2
 * @param {number} fallbackDuration - Minutes used when durationMinutes is absent
 * @param {string} [timezone]       - IANA tz; defaults to browser tz
 * @returns {boolean}
 */
export const doEventsOverlap = (event1, event2, fallbackDuration = 60, timezone) => {
  const tz = timezone || getUserTimezone();
  const range1 = getEventUTCRange(event1, fallbackDuration, tz);
  const range2 = getEventUTCRange(event2, fallbackDuration, tz);

  // If UTC parsing succeeded for both events use real overlap check
  if (range1 && range2) {
    // Overlap iff NOT (one ends before the other starts)
    return !(range1.endMs <= range2.startMs || range2.endMs <= range1.startMs);
  }

  // --- Fallback: legacy minutes-from-midnight approach (timezone-blind) ---
  // Only reached when date/time fields are unparseable (e.g. undefined).
  // The legacy code compared raw date strings; we still do that but via
  // normalizeDateString for format-tolerance.
  const d1 = normalizeDateString(event1?.date);
  const d2 = normalizeDateString(event2?.date);
  if (d1 && d2 && d1 !== d2) return false;

  const r1 = getEventTimeRange(event1, fallbackDuration);
  const r2 = getEventTimeRange(event2, fallbackDuration);
  return r1.startMinutes < r2.endMinutes && r1.endMinutes > r2.startMinutes;
};

/**
 * Find all events in registeredEvents that conflict with newEvent.
 *
 * Null/undefined entries in registeredEvents are silently skipped. They can
 * appear when localStorage is partially written (page closed mid-save), when
 * a registration object has an explicitly null .event field, or when test
 * fixtures pass sparse arrays. Without the filter(Boolean) guards the .map()
 * call throws TypeError accessing .event on null.
 *
 * @param {object} newEvent
 * @param {Array}  registeredEvents
 * @param {number} fallbackDuration
 * @param {string} [timezone]
 * @returns {Array}
 */
export const findConflictingEvents = (
  newEvent,
  registeredEvents,
  fallbackDuration = 60,
  timezone
) => {
  if (!registeredEvents || registeredEvents.length === 0) return [];

  const tz = timezone || getUserTimezone();

  return registeredEvents
    .filter(Boolean)                           // drop null/undefined registration entries
    .map((reg) => reg.event || reg)
    .filter(Boolean)                           // drop registrations whose .event is also null
    .filter((event) => !newEvent.id || !event.id || event.id !== newEvent.id)
    .filter((event) => doEventsOverlap(newEvent, event, fallbackDuration, tz));
};

/**
 * Check whether registering for newEvent would cause a scheduling conflict.
 *
 * @param {object} newEvent
 * @param {Array}  registeredEvents
 * @param {number} fallbackDuration
 * @param {string} [timezone]
 * @returns {{ hasConflict: boolean, conflicts: Array }}
 */
export const checkRegistrationConflict = (
  newEvent,
  registeredEvents,
  fallbackDuration = 60,
  timezone
) => {
  const conflicts = findConflictingEvents(newEvent, registeredEvents, fallbackDuration, timezone);
  return { hasConflict: conflicts.length > 0, conflicts };
};

/**
 * Suggest alternative events that don't conflict with the user's registered events.
 *
 * Null/undefined entries in registeredEvents are filtered out before building
 * the registeredIds set to prevent TypeError on .event?.id access when entries
 * are null (same root cause as the findConflictingEvents fix).
 *
 * @param {object} targetEvent
 * @param {Array}  allEvents
 * @param {Array}  registeredEvents
 * @param {number} fallbackDuration
 * @param {number} maxSuggestions
 * @param {string} [timezone]
 * @returns {Array}
 */
export const suggestAlternativeEvents = (
  targetEvent,
  allEvents,
  registeredEvents,
  fallbackDuration = 60,
  maxSuggestions = 3,
  timezone
) => {
  if (!allEvents || allEvents.length === 0) return [];

  const tz = timezone || getUserTimezone();

  // Exclude the target event and already-registered events.
  // filter(Boolean) drops null/undefined entries before accessing .event?.id.
  const safeRegistered = (registeredEvents || []).filter(Boolean);
  const registeredIds = new Set(safeRegistered.map((reg) => reg.event?.id || reg.id));
  const availableEvents = allEvents.filter(Boolean).filter((event) => {
    return event.id !== targetEvent.id && !registeredIds.has(event.id);
  });

  // Keep only events that don't conflict with existing registrations
  const nonConflictingEvents = availableEvents.filter((event) => {
    const { hasConflict } = checkRegistrationConflict(
      event,
      safeRegistered,
      fallbackDuration,
      tz
    );
    return !hasConflict;
  });

  // Prioritise events of the same category / type / tags as the target
  const targetTagSet = new Set(targetEvent.tags || []);

  const sameCategoryEvents = nonConflictingEvents.filter(
    (event) =>
      event.category === targetEvent.category ||
      event.type === targetEvent.type ||
      event.tags?.some((tag) => targetTagSet.has(tag))
  );

  if (sameCategoryEvents.length >= maxSuggestions) {
    return sameCategoryEvents.slice(0, maxSuggestions);
  }

  const sameCategorySet = new Set(sameCategoryEvents);
  const otherEvents = nonConflictingEvents.filter((event) => !sameCategorySet.has(event));

  return [...sameCategoryEvents, ...otherEvents].slice(0, maxSuggestions);
};

/**
 * Format a time range for display.
 *
 * When a timezone is provided (or can be detected) the times are rendered in
 * that timezone via Intl.DateTimeFormat. Falls back to the legacy AM/PM string
 * formatter when date context is unavailable.
 *
 * @param {string} timeStr       - "HH:MM AM/PM" or "HH:MM"
 * @param {number} durationMinutes
 * @param {string} [dateStr]     - Optional date string for timezone-aware rendering
 * @param {string} [timezone]    - IANA tz; defaults to browser tz
 * @returns {string}  e.g. "10:00 AM – 11:30 AM"
 */
export const formatTimeRange = (timeStr, durationMinutes = 60, dateStr, timezone) => {
  const tz = timezone || getUserTimezone();

  // Timezone-aware path: requires a date string
  if (dateStr) {
    const startMs = parseEventToUTC(dateStr, timeStr, tz);
    if (startMs !== null) {
      const endMs = startMs + durationMinutes * 60 * 1000;

      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${fmt.format(new Date(startMs))} – ${fmt.format(new Date(endMs))}`;
    }
  }

  // Legacy fallback: minutes-from-midnight arithmetic (no tz context)
  const startMinutes = parseTimeToMinutes(timeStr);
  const endMinutes = startMinutes + durationMinutes;

  const formatMinutes = (mins) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
  };

  return `${formatMinutes(startMinutes)} – ${formatMinutes(endMinutes)}`;
};
