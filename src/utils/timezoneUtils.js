export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

export const formatEventDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZoneName: "short",
  }).format(date);
};

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
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
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
  if (!timeStr || typeof timeStr !== "string") return null;

  const clean = timeStr.trim();

  // 12-hour AM/PM format
  const amPmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = parseInt(amPmMatch[2], 10);
    const period = amPmMatch[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

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

export const parseEventToUTC = (dateStr, timeStr, timezone) => {
  const tz = timezone || getUserTimezone();
  const normalizedDate = normalizeDateString(dateStr);
  const parsedTime = parseTimeString(timeStr);

  if (!normalizedDate || !parsedTime) return null;

  const [year, month, day] = normalizedDate.split("-").map(Number);
  const { hours, minutes } = parsedTime;

  const targetLocalMs = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);

  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    let utcCandidate = targetLocalMs;

    for (let i = 0; i < 4; i += 1) {
      const parts = Object.fromEntries(
        formatter.formatToParts(utcCandidate).map((p) => [p.type, p.value])
      );

      const tzYear = parseInt(parts.year, 10);
      const tzMonth = parseInt(parts.month, 10) - 1;
      const tzDay = parseInt(parts.day, 10);
      const tzHour = parseInt(parts.hour, 10) % 24;
      const tzMinute = parseInt(parts.minute, 10);
      const formattedLocalMs = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, 0, 0);
      const delta = targetLocalMs - formattedLocalMs;

      if (delta === 0) return utcCandidate;
      utcCandidate += delta;
    }

    return utcCandidate;
  } catch {
    return new Date(year, month - 1, day, hours, minutes).getTime();
  }
};

export const parseEventDateTimeLocal = (dateStr, timeStr) => {
  const normalizedDate = normalizeDateString(dateStr);
  const parsedTime = parseTimeString(timeStr || "12:00 AM");

  if (!normalizedDate || !parsedTime) return null;

  const [year, month, day] = normalizedDate.split("-").map(Number);
  const { hours, minutes } = parsedTime;

  return new Date(year, month - 1, day, hours, minutes);
};

export const isDST = (date = new Date()) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return false;
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== date.getTimezoneOffset();
};

export const resolveEventInstant = (dateStr, timeStr, timezone) => {
  const utcMs = parseEventToUTC(dateStr, timeStr, timezone);
  if (utcMs === null || Number.isNaN(utcMs)) {
    return null;
  }
  return new Date(utcMs);
};
