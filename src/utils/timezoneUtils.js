/**
 * Timezone Utilities
 *
 * Helpers for timezone detection, timezone-aware date/time parsing,
 * DST transition handling, and cross-timezone slot availability.
 * Used by conflictDetection.js to convert event local times to UTC epoch ms
 * so that cross-timezone overlaps are computed correctly.
 */

/**
 * Return the IANA timezone identifier for the current user's browser.
 * Falls back to "UTC" if detection fails.
 * @returns {string} e.g. "America/New_York"
 */
export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/**
 * Format a date-string into a human-readable local string with timezone label.
 * @param {string} dateString - ISO 8601 or any Date-parseable string
 * @returns {string} e.g. "May 25, 2026, 10:00 AM IST"
 */
export const formatEventDateTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZoneName: 'short',
  }).format(date);
};

/**
 * Normalise a variety of date formats to a canonical "YYYY-MM-DD" string.
 * Supports:
 *   - ISO 8601  : "2026-05-25" / "2026-05-25T10:00:00Z"
 *   - Long form : "May 25, 2026"
 *   - Already canonical "YYYY-MM-DD"
 *
 * Returns null when the input cannot be parsed.
 * @param {string} dateInput
 * @returns {string|null} "YYYY-MM-DD" or null
 */
export const normalizeDateString = (dateInput) => {
  if (!dateInput) return null;

  // Already "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;

  // ISO with time component — strip the time part
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateInput)) {
    return dateInput.slice(0, 10);
  }

  // "Month DD, YYYY" (e.g. "May 25, 2026")
  const parsed = new Date(dateInput);
  if (!Number.isNaN(parsed.getTime())) {
    // Use local parts to avoid off-by-one from local tz offset
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
};

/**
 * Parse a 12-hour AM/PM time string to a 24-hour { hours, minutes } object.
 * Accepts "HH:MM AM", "H:MM PM", and plain 24-h "HH:MM".
 * Returns null if parsing fails.
 * @param {string} timeStr
 * @returns {{ hours: number, minutes: number }|null}
 */
export const parseTimeString = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const clean = timeStr.trim();

  // 12-hour AM/PM format
  const amPmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = parseInt(amPmMatch[2], 10);
    const period = amPmMatch[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  }

  // 24-hour format
  const h24Match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    return {
      hours: parseInt(h24Match[1], 10),
      minutes: parseInt(h24Match[2], 10),
    };
  }

  return null;
};

/**
 * Convert an event's local date + time string into a UTC epoch timestamp (ms).
 *
 * The conversion is performed via Intl.DateTimeFormat so that DST transitions
 * for the given timezone are handled correctly — no manual offset arithmetic.
 *
 * @param {string} dateStr   - Any date string accepted by normalizeDateString()
 * @param {string} timeStr   - Time string accepted by parseTimeString()
 * @param {string} [timezone] - IANA timezone (defaults to getUserTimezone())
 * @returns {number|null} UTC epoch ms, or null if inputs cannot be parsed
 */
export const parseEventToUTC = (dateStr, timeStr, timezone) => {
  const tz = timezone || getUserTimezone();
  const normalizedDate = normalizeDateString(dateStr);
  const parsedTime = parseTimeString(timeStr);

  if (!normalizedDate || !parsedTime) return null;

  const [year, month, day] = normalizedDate.split('-').map(Number);
  const { hours, minutes } = parsedTime;

  try {
    const utcCandidate = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);

    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(utcCandidate).map((p) => [p.type, p.value])
    );

    const tzYear = parseInt(parts.year, 10);
    const tzMonth = parseInt(parts.month, 10) - 1;
    const tzDay = parseInt(parts.day, 10);
    const tzHour = parseInt(parts.hour, 10) % 24;
    const tzMinute = parseInt(parts.minute, 10);

    const diff =
      utcCandidate -
      Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, 0, 0);

    return utcCandidate + diff;
  } catch {
    return new Date(year, month - 1, day, hours, minutes).getTime();
  }
};

/**
 * Parse an event's local date + time string into a native Date object in local time.
 * Safe for cross-browser parsing (e.g. Safari / iOS WebKit).
 *
 * @param {string} dateStr
 * @param {string} [timeStr]
 * @returns {Date|null}
 */
export const parseEventDateTimeLocal = (dateStr, timeStr) => {
  const normalizedDate = normalizeDateString(dateStr);
  const parsedTime = parseTimeString(timeStr || "12:00 AM");

  if (!normalizedDate || !parsedTime) return null;

  const [year, month, day] = normalizedDate.split('-').map(Number);
  const { hours, minutes } = parsedTime;

  return new Date(year, month - 1, day, hours, minutes);
};

// ===========================================================================
// NEW FEATURE ADDITIONS: Advanced DST Resolution & Cross-Timezone Scheduler
// ===========================================================================

/**
 * Get detailed timezone offset information for a specific instant or Date object.
 *
 * @param {Date|number} [date=new Date()] - Reference date or timestamp
 * @param {string} [timezone=getUserTimezone()] - Target IANA timezone
 * @returns {{ offsetMinutes: number, formattedOffset: string, timeZoneName: string, isDST: boolean }}
 */
export const getTimezoneOffsetInfo = (date = new Date(), timezone = getUserTimezone()) => {
  const targetDate = typeof date === 'number' ? new Date(date) : date;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(targetDate).map((p) => [p.type, p.value])
    );

    // Construct the wall clock time in the target timezone as if it were UTC
    const wallClockUtc = Date.UTC(
      parseInt(parts.year, 10),
      parseInt(parts.month, 10) - 1,
      parseInt(parts.day, 10),
      parseInt(parts.hour, 10) % 24,
      parseInt(parts.minute, 10),
      parseInt(parts.second, 10)
    );

    // Difference in minutes between wall clock and actual UTC
    const offsetMinutes = Math.round((wallClockUtc - targetDate.getTime()) / 60000);
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const h = String(Math.floor(absMinutes / 60)).padStart(2, '0');
    const m = String(absMinutes % 60).padStart(2, '0');

    // Heuristic DST check: compare current offset against January offset for the same timezone
    const janDate = new Date(targetDate.getFullYear(), 0, 1);
    const janParts = Object.fromEntries(
      formatter.formatToParts(janDate).map((p) => [p.type, p.value])
    );
    const janWallUtc = Date.UTC(
      parseInt(janParts.year, 10),
      parseInt(janParts.month, 10) - 1,
      parseInt(janParts.day, 10),
      parseInt(janParts.hour, 10) % 24,
      parseInt(janParts.minute, 10)
    );
    const janOffset = Math.round((janWallUtc - janDate.getTime()) / 60000);

    return {
      offsetMinutes,
      formattedOffset: `UTC${sign}${h}:${m}`,
      timeZoneName: parts.timeZoneName || timezone,
      isDST: offsetMinutes !== janOffset,
    };
  } catch {
    return {
      offsetMinutes: 0,
      formattedOffset: 'UTC+00:00',
      timeZoneName: 'UTC',
      isDST: false,
    };
  }
};

/**
 * Enhanced DST-Aware conversion from local date/time to UTC epoch ms.
 * Handles ambiguity in DST transitions:
 *  - "spring forward" (gap): forward shifts time by missing duration
 *  - "fall back" (overlap): resolves via strategy ('earlier' or 'later')
 *
 * @param {string} dateStr - Date string
 * @param {string} timeStr - Time string
 * @param {string} [timezone] - Target IANA timezone
 * @param {'earlier'|'later'} [ambiguityStrategy='earlier'] - Ambiguity resolution strategy
 * @returns {number|null} UTC epoch ms
 */
export const parseEventToUTCDstAware = (
  dateStr,
  timeStr,
  timezone,
  ambiguityStrategy = 'earlier'
) => {
  const initialUtc = parseEventToUTC(dateStr, timeStr, timezone);
  if (initialUtc === null) return null;

  const tz = timezone || getUserTimezone();

  // Test surrounding candidates to verify if we fell into a DST fold/gap
  const offset1 = getTimezoneOffsetInfo(initialUtc - 3600000, tz).offsetMinutes;
  const offset2 = getTimezoneOffsetInfo(initialUtc + 3600000, tz).offsetMinutes;

  if (offset1 !== offset2) {
    // In an overlap (fall back), adjust based on strategy
    if (ambiguityStrategy === 'later') {
      const shiftMs = (offset1 - offset2) * 60000;
      return initialUtc + Math.abs(shiftMs);
    }
  }

  return initialUtc;
};

/**
 * Format a start and end date/time range within a specified target timezone.
 * Condenses identical components (e.g., "May 25, 2026, 10:00 AM – 11:30 AM EDT").
 *
 * @param {string|number|Date} startInput - Start date/time
 * @param {string|number|Date} endInput - End date/time
 * @param {string} [timezone] - Target timezone
 * @returns {string} Formatted event range
 */
export const formatEventRangeInTimezone = (startInput, endInput, timezone) => {
  const tz = timezone || getUserTimezone();
  const start = new Date(startInput);
  const end = new Date(endInput);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'short',
  });

  const startDateStr = dateFormatter.format(start);
  const endDateStr = dateFormatter.format(end);
  const startTimeStr = timeFormatter.format(start);
  const endTimeStr = timeFormatter.format(end);

  const tzName = tzFormatter
    .formatToParts(start)
    .find((p) => p.type === 'timeZoneName')?.value || '';

  if (startDateStr === endDateStr) {
    return `${startDateStr}, ${startTimeStr} – ${endTimeStr} ${tzName}`.trim();
  }

  return `${startDateStr}, ${startTimeStr} – ${endDateStr}, ${endTimeStr} ${tzName}`.trim();
};

/**
 * Find overlapping available meeting windows across multiple participants across timezones.
 *
 * @param {Array<{ id: string, timezone: string, workStart: string, workEnd: string }>} participants
 * @param {string} dateStr - Date string "YYYY-MM-DD"
 * @param {number} [durationMinutes=30] - Minimum slot duration in minutes
 * @returns {Array<{ startUtc: number, endUtc: number, formattedSlots: Record<string, string> }>}
 */
export const findCrossTimezoneOverlap = (participants, dateStr, durationMinutes = 30) => {
  if (!Array.isArray(participants) || participants.length === 0) return [];

  // 1. Calculate UTC windows for each participant's working hours on dateStr
  const participantWindows = participants.map((p) => {
    const startUtc = parseEventToUTCDstAware(dateStr, p.workStart || '09:00 AM', p.timezone);
    const endUtc = parseEventToUTCDstAware(dateStr, p.workEnd || '05:00 PM', p.timezone);
    return { id: p.id, timezone: p.timezone, startUtc, endUtc };
  });

  if (participantWindows.some((w) => w.startUtc === null || w.endUtc === null)) {
    return [];
  }

  // 2. Compute intersection of all participant windows
  const latestStartUtc = Math.max(...participantWindows.map((w) => w.startUtc));
  const earliestEndUtc = Math.min(...participantWindows.map((w) => w.endUtc));

  const durationMs = durationMinutes * 60000;
  if (earliestEndUtc - latestStartUtc < durationMs) {
    return []; // No sufficient overlapping window found
  }

  // 3. Generate available slots in increments of durationMinutes
  const slots = [];
  let currentStart = latestStartUtc;

  while (currentStart + durationMs <= earliestEndUtc) {
    const currentEnd = currentStart + durationMs;

    // Map the slot to formatted local strings for each participant
    const formattedSlots = {};
    participants.forEach((p) => {
      formattedSlots[p.id] = formatEventRangeInTimezone(currentStart, currentEnd, p.timezone);
    });

    slots.push({
      startUtc: currentStart,
      endUtc: currentEnd,
      formattedSlots,
    });

    currentStart += durationMs;
  }

  return slots;
};