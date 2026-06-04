/**
 * Timezone Utilities
 *
 * Helpers for timezone detection and timezone-aware date/time parsing.
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

  // Build an ISO string with the local date/time and force-interpret it in the
  // target timezone by using the "en" locale with the explicit timeZone option.
  // We do this by constructing the date in UTC-0 first and then calculating
  // the actual UTC moment by comparing what the formatter says vs UTC midnight.
  //
  // Strategy: use Date.UTC as a base, then apply the timezone offset correction
  // by comparing the Intl-formatted date back to the numeric value.
  try {
    // Construct a UTC candidate by treating the local time as-if UTC
    const utcCandidate = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);

    // Now find what date/time the UTC candidate looks like in the target tz
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
    const tzHour = parseInt(parts.hour, 10); // handle "24" edge case via Date.UTC automatic rollover
    const tzMinute = parseInt(parts.minute, 10);

    // Offset in ms between what the tz formatter sees and what we intended
    const diff =
      utcCandidate -
      Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, 0, 0);

    return utcCandidate + diff;
  } catch {
    // Fallback: treat the time as local browser time
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