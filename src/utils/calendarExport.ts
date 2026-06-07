/**
 * @fileoverview Calendar export utilities for EventTimeline (#7654)
 *
 * Provides:
 *  - `generateIcsContent`  — builds a valid RFC 5545 iCalendar string
 *  - `downloadIcs`         — triggers a browser download of the .ics file
 *  - `buildGoogleCalendarUrl` — creates a prefilled Google Calendar deep-link
 *    for a single event (Google Calendar only supports one event per URL)
 *
 * All date/time values are converted to UTC before output, as required by
 * RFC 5545 §3.3.5.
 */

import type { Event } from "../components/EventTimeline";

// ─── Internal helpers ───────────────────────────────────────────────────────

/**
 * Parse a "YYYY-MM-DD" date string and an optional "HH:MM AM/PM" time string
 * into a Date object (local time, consistent with EventTimeline's parseDateTime).
 *
 * Falls back to midnight on the given date when `timeStr` is absent or unparseable.
 */
const parseEventDateTime = (dateStr: string, timeStr: string): Date => {
  const base = new Date(dateStr);
  if (isNaN(base.getTime())) return new Date(0);

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      else if (ampm === "AM" && hours === 12) hours = 0;
    }
  }

  base.setHours(hours, minutes, 0, 0);
  return base;
};

/**
 * Format a Date as an RFC 5545 UTC datetime string: `YYYYMMDDTHHMMSSZ`
 */
const toIcsUtcDateTime = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z",
  ].join("");
};

/**
 * Escape text for iCalendar property values per RFC 5545 §3.3.11.
 * Commas, semicolons, and backslashes must be escaped; newlines become `\n`.
 */
const escapeIcsText = (text: string): string =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

/**
 * Fold long iCalendar lines at 75 octets (RFC 5545 §3.1).
 * Continuation lines begin with a single SPACE character.
 */
const foldLine = (line: string): string => {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  while (remaining.length > 75) {
    parts.push(remaining.slice(0, 75));
    remaining = " " + remaining.slice(75);
  }
  parts.push(remaining);
  return parts.join("\r\n");
};

// ─── Exported API ───────────────────────────────────────────────────────────

/**
 * Generate a valid RFC 5545 iCalendar string from a list of EventTimeline
 * events. Each event becomes a VEVENT component with:
 *
 *  - DTSTART / DTEND (UTC, 1-hour default duration)
 *  - SUMMARY (title)
 *  - DESCRIPTION (if present)
 *  - LOCATION (if present)
 *  - UID (stable, derived from event id + domain)
 *  - DTSTAMP (current UTC instant, as required by RFC 5545)
 *
 * @param events  - Array of EventTimeline Event objects
 * @param calName - Display name for the calendar (VCALENDAR X-WR-CALNAME)
 * @returns Formatted iCalendar string
 */
export const generateIcsContent = (
  events: Event[],
  calName = "Eventra Schedule"
): string => {
  const now = toIcsUtcDateTime(new Date());

  const vevents = events
    .map((event) => {
      const start = parseEventDateTime(event.date, event.time);
      // Default event duration: 1 hour
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const dtStart = toIcsUtcDateTime(start);
      const dtEnd = toIcsUtcDateTime(end);

      // Stable UID: event id + domain so repeat exports don't create duplicates
      const uid = `eventra-${event.id}@eventra.app`;

      const lines: string[] = [
        "BEGIN:VEVENT",
        foldLine(`UID:${uid}`),
        `DTSTAMP:${now}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        foldLine(`SUMMARY:${escapeIcsText(event.title)}`),
      ];

      if (event.location) {
        lines.push(foldLine(`LOCATION:${escapeIcsText(event.location)}`));
      }

      if (event.description) {
        lines.push(foldLine(`DESCRIPTION:${escapeIcsText(event.description)}`));
      }

      if (event.category) {
        lines.push(foldLine(`CATEGORIES:${escapeIcsText(event.category)}`));
      }

      lines.push("END:VEVENT");
      return lines.join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra//EventTimeline//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${escapeIcsText(calName)}`),
    "X-WR-TIMEZONE:UTC",
    vevents,
    "END:VCALENDAR",
  ].join("\r\n");
};

/**
 * Trigger a browser download of the timeline as a `.ics` file.
 *
 * Uses a Blob URL to avoid any server round-trip — the file is generated
 * entirely client-side.
 *
 * @param events   - Array of EventTimeline Event objects
 * @param filename - Downloaded file name (default: `eventra-schedule.ics`)
 */
export const downloadIcs = (
  events: Event[],
  filename = "eventra-schedule.ics"
): void => {
  const content = generateIcsContent(events);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up — defer so some browsers have time to initiate the download
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Build a Google Calendar "Add Event" deep-link URL for a single event.
 *
 * Google Calendar only supports one event per URL, so this generates a link
 * for the **first** event in the array (earliest in the sorted timeline).
 * For full export, the .ics path is the correct choice.
 *
 * URL format:
 *   https://calendar.google.com/calendar/r/eventedit
 *     ?text=<title>
 *     &dates=<YYYYMMDDTHHMMSSZ>/<YYYYMMDDTHHMMSSZ>
 *     &details=<description>
 *     &location=<location>
 *
 * @param event - A single EventTimeline Event object
 * @returns A fully encoded Google Calendar URL string
 */
export const buildGoogleCalendarUrl = (event: Event): string => {
  const start = parseEventDateTime(event.date, event.time);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const params = new URLSearchParams({
    text: event.title,
    dates: `${toIcsUtcDateTime(start)}/${toIcsUtcDateTime(end)}`,
    ...(event.description ? { details: event.description } : {}),
    ...(event.location ? { location: event.location } : {}),
  });

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
};
