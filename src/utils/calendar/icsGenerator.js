/**
 * Dynamic iCalendar RFC 5545 standard compliant .ics text file generator (#16284)
 */

export function generateICSFeedString(events = []) {
  const parts = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra Inc//Calendar Feed Exporter//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  events.forEach((evt) => {
    parts.push(
      "BEGIN:VEVENT",
      `UID:${evt.id}@eventra.io`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${new Date(evt.start).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTEND:${new Date(evt.end).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description}`,
      "END:VEVENT"
    );
  });

  parts.push("END:VCALENDAR");
  return parts.join("\r\n");
}
