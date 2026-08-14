/**
 * Export Event Schedule to ICS Format with VTIMEZONE and DST boundary support.
 */

import { getTimezoneOffsetInfo } from "./timezoneUtils.js";

const formatOffset = (offsetMinutes) => {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hh = String(Math.floor(absMinutes / 60)).padStart(2, "0");
  const mm = String(absMinutes % 60).padStart(2, "0");
  return `${sign}${hh}${mm}`;
};

export function buildVTimezoneBlock(tz = "UTC") {
  const standard = getTimezoneOffsetInfo(new Date(), tz);
  const offset = formatOffset(standard.offsetMinutes);
  return `BEGIN:VTIMEZONE
TZID:${tz}
X-LIC-LOCATION:${tz}
BEGIN:STANDARD
TZOFFSETFROM:${offset}
TZOFFSETTO:${offset}
TZNAME:${standard.timeZoneName || tz}
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE`;
}

export function exportToIcs(event, timezone = "UTC") {
  const tz = timezone || "UTC";
  const title = event.title || event.name || "Eventra Event";
  const description = (event.description || "").replace(/\n/g, "\\n");
  const startDateStr = event.date || new Date().toISOString();
  
  const vTimezone = buildVTimezoneBlock(tz);

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra Event Platform//EN",
    "CALSCALE:GREGORIAN",
    vTimezone,
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `DTSTART;TZID=${tz}:${startDateStr.replace(/[-:]/g, "").split(".")[0]}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");

  if (typeof window === "undefined" || typeof document === "undefined") {
    console.warn("[ICS] Export is only supported in browser environments");
    return;
  }

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
