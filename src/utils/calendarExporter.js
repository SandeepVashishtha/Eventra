/**
 * Calendar Exporter Utility (RFC 5545 Compliant)
 * 
 * Provides robust mechanisms to generate downloadable standard .ics files
 * and external calendar subscription URLs (Google Calendar, Outlook Web).
 */

// Helper to format Date objects into YYYYMMDDTHHmmSSZ format required by RFC 5545
const formatToICSDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

// Helper to safely escape special characters in ICS strings
const escapeICSText = (text = "") => {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
};

/**
 * Downloads a standard .ics iCalendar file for the given event.
 */
export const downloadICSFile = (event) => {
  const { title, description, date, endDate, location, id } = event;
  
  const formattedStart = formatToICSDate(date);
  if (!formattedStart) {
    console.error("Invalid event date provided for ICS export.");
    return;
  }
  
  const formattedEnd = endDate ? formatToICSDate(endDate) : formatToICSDate(new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000));
  const createdDate = formatToICSDate(new Date());

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra//Event Organizer Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:eventra-${id || Date.now()}@eventra.com`,
    `DTSTAMP:${createdDate}`,
    `DTSTART:${formattedStart}`,
    `DTEND:${formattedEnd}`,
    `SUMMARY:${escapeICSText(title || "Eventra Scheduled Event")}`,
    `DESCRIPTION:${escapeICSText(description || "Event organized through the Eventra Platform.")}`,
    `LOCATION:${escapeICSText(location || "Virtual / Online Event")}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const icsString = icsLines.join("\r\n");
  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${(title || "event").toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates an external Google Calendar addition link.
 */
export const generateGoogleCalendarLink = (event) => {
  const { title, description, date, endDate, location } = event;
  const start = formatToICSDate(date);
  if (!start) return null;
  
  const end = endDate ? formatToICSDate(endDate) : formatToICSDate(new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000));
  
  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Eventra Event",
    dates: `${start}/${end}`,
    details: description || "Event organized through the Eventra Platform.",
    location: location || "Virtual / Online Event",
    sf: "true",
    output: "xml"
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generates an external Outlook Web addition link.
 */
export const generateOutlookLink = (event) => {
  const { title, description, date, endDate, location } = event;
  const startDate = new Date(date);
  if (isNaN(startDate.getTime())) return null;
  
  const start = startDate.toISOString();
  const end = endDate ? new Date(endDate).toISOString() : new Date(startDate.getTime() + 2 * 60 * 60 * 1000).toISOString();

  const baseUrl = "https://outlook.live.com/calendar/0/deeplink/compose";
  const params = new URLSearchParams({
    rru: "addevent",
    subject: title || "Eventra Event",
    startdt: start,
    enddt: end,
    body: description || "Event organized through the Eventra Platform.",
    location: location || "Virtual / Online Event"
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Downloads a single .ics file containing multiple events.
 * Supports both flat event objects and nested registration objects.
 * @param {Array} events - List of event/registration objects to export
 * @param {string} filename - Custom filename for the downloaded file
 */
export const downloadBulkICSFile = (events, filename = "registered-events") => {
  if (!Array.isArray(events) || events.length === 0) return;

  const createdDate = formatToICSDate(new Date());
  
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra//Event Organizer Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  events.forEach((item) => {
    const eventObj = item.event ? item.event : item;
    const { title, description, date, endDate, location, id } = eventObj;
    
    const formattedStart = formatToICSDate(date);
    if (!formattedStart) return; // Skip invalid event
    
    const formattedEnd = endDate ? formatToICSDate(endDate) : formatToICSDate(new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000));

    icsLines.push(
      "BEGIN:VEVENT",
      `UID:eventra-${id || Math.random().toString(36).substring(2, 9)}@eventra.com`,
      `DTSTAMP:${createdDate}`,
      `DTSTART:${formattedStart}`,
      `DTEND:${formattedEnd}`,
      `SUMMARY:${escapeICSText(title || "Eventra Scheduled Event")}`,
      `DESCRIPTION:${escapeICSText(description || "Event organized through the Eventra Platform.")}`,
      `LOCATION:${escapeICSText(location || "Virtual / Online Event")}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT"
    );
  });

  icsLines.push("END:VCALENDAR");

  const icsString = icsLines.join("\r\n");
  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

