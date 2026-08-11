/**
 * Export Event Schedule to ICS Format with VTIMEZONE and DST boundary support.
 */

export function buildVTimezoneBlock(tz = "UTC") {
  return `BEGIN:VTIMEZONE
TZID:${tz}
X-LIC-LOCATION:${tz}
BEGIN:STANDARD
TZOFFSETFROM:+0000
TZOFFSETTO:+0000
TZNAME:UTC
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

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
