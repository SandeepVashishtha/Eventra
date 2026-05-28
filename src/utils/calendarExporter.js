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

// Helper to safely escape special characters in ICS strings (RFC 5545 compliant).
// Carriage returns (\r) are stripped before newlines are escaped so that
// user-supplied text cannot inject extra ICS content lines via CRLF sequences.
const escapeICSText = (text = "") => {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r/g, "")
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
  
  try {
    document.body.appendChild(link);
    link.click();
  } finally {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }
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
  
  try {
    document.body.appendChild(link);
    link.click();
  } finally {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }
};

// Helper to parse dates and times cleanly without external imports in utility
const parseISOString = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length !== 3) return new Date(dateStr);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseTimeString = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourMatch) {
    return {
      hours: parseInt(twentyFourMatch[1], 10),
      minutes: parseInt(twentyFourMatch[2], 10),
    };
  }

  return null;
};

const buildDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;
  const base = parseISOString(dateValue);
  if (isNaN(base.getTime())) return null;

  const timeParts = parseTimeString(timeValue);
  if (!timeParts) return base;

  base.setHours(timeParts.hours, timeParts.minutes, 0, 0);
  return base;
};

export const getEventDateRange = (event) => {
  const startDate = event?.startDate || event?.date;
  const endDate = event?.endDate || event?.date || startDate;
  if (!startDate) return null;

  const startTime = event?.startTime || event?.time || "";
  const endTime = event?.endTime || "";

  const start = buildDateTime(startDate, startTime);
  if (!start) return null;

  const hasTime = Boolean(startTime);
  let end = buildDateTime(endDate, endTime);

  if (!end) {
    // Default duration: 2 hours
    end = hasTime ? new Date(start.getTime() + 2 * 60 * 60 * 1000) : start;
  }

  if (end < start) {
    // Guard: End time must be after start
    end = new Date(start.getTime() + 1 * 60 * 60 * 1000);
  }

  return {
    start: start,
    end: hasTime ? end : new Date(end.getTime() + 24 * 60 * 60 * 1000),
    allDay: !hasTime,
  };
};

/**
 * Analyzes a list of events/registrations for timing overlaps and tight transition buffers.
 * @param {Array} items - List of event objects or registration objects
 * @returns {Array} - List of detected conflicts with type, details, and labels
 */
export const analyzeScheduleConflicts = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  // Extract and normalize events with calculated start/end dates
  const normalized = items
    .map((item) => {
      const event = item.event ? item.event : item;
      const range = getEventDateRange(event);
      return {
        originalItem: item,
        event,
        range,
      };
    })
    .filter((entry) => entry.range && !entry.range.allDay); // Ignore all-day events for precision timing analysis

  // Sort chronologically by start date
  normalized.sort((a, b) => a.range.start.getTime() - b.range.start.getTime());

  const conflicts = [];

  for (let i = 0; i < normalized.length; i++) {
    const current = normalized[i];
    for (let j = i + 1; j < normalized.length; j++) {
      const next = normalized[j];

      // Check if they are on the same day (to avoid comparing distant events)
      const sameDay =
        current.range.start.getFullYear() === next.range.start.getFullYear() &&
        current.range.start.getMonth() === next.range.start.getMonth() &&
        current.range.start.getDate() === next.range.start.getDate();

      if (!sameDay) continue;

      const gapMs = next.range.start.getTime() - current.range.end.getTime();

      if (gapMs < 0) {
        // Overlap detected!
        conflicts.push({
          type: "overlap",
          eventA: current.event,
          eventB: next.event,
          gapMs,
          label: `Overlap between "${current.event.title}" and "${next.event.title}"`,
        });
      } else if (gapMs < 15 * 60 * 1000) {
        // Transition buffer less than 15 minutes!
        conflicts.push({
          type: "buffer",
          eventA: current.event,
          eventB: next.event,
          gapMs,
          label: `Tight transition gap (${Math.round(gapMs / 1000 / 60)} minutes) between "${current.event.title}" and "${next.event.title}"`,
        });
      }
    }
  }

  return conflicts;
};

/**
 * Generates rescheduling suggestions for a conflicting event.
 * It searches the catalog for other workshops/sessions in the same category/tags that do not conflict.
 */
export const getReschedulingSuggestions = (conflictingEvent, registeredItems, allCatalogEvents = []) => {
  if (!conflictingEvent || !Array.isArray(allCatalogEvents) || allCatalogEvents.length === 0) return [];

  // 1. Get other registered events (excluding the one we want to reschedule/replace)
  const otherRegistered = registeredItems
    .map(item => item.event ? item.event : item)
    .filter(event => event.id !== conflictingEvent.id);

  const normalizedOther = otherRegistered
    .map(event => ({ event, range: getEventDateRange(event) }))
    .filter(entry => entry.range && !entry.range.allDay);

  // 2. Find alternative candidate events from catalog in the same category or tags
  const candidates = allCatalogEvents.filter(event => {
    // Must not be the conflicting event itself
    if (event.id === conflictingEvent.id) return false;
    
    // Must not be already registered
    const isAlreadyRegistered = registeredItems.some(item => {
      const regEvent = item.event ? item.event : item;
      return regEvent.id === event.id;
    });
    if (isAlreadyRegistered) return false;

    // Filter by category or tags
    const sameCategory = String(event.category || "").toLowerCase() === String(conflictingEvent.category || "").toLowerCase();
    const matchesTags = (event.tags || []).some(t => (conflictingEvent.tags || []).includes(t));
    const sameType = String(event.type || "").toLowerCase() === String(conflictingEvent.type || "").toLowerCase();

    return (sameCategory || matchesTags) && sameType;
  });

  const suggestions = [];

  for (const candidate of candidates) {
    const candRange = getEventDateRange(candidate);
    if (!candRange || candRange.allDay) continue;

    // Check if candidate conflicts with any of the other registered events
    let hasConflict = false;
    for (const reg of normalizedOther) {
      // Check same day only
      const sameDay =
        candRange.start.getFullYear() === reg.range.start.getFullYear() &&
        candRange.start.getMonth() === reg.range.start.getMonth() &&
        candRange.start.getDate() === reg.range.start.getDate();

      if (!sameDay) continue;

      const gapMs = Math.min(
        Math.abs(candRange.start.getTime() - reg.range.end.getTime()),
        Math.abs(reg.range.start.getTime() - candRange.end.getTime())
      );

      // Check overlap or tight transition gap (< 15 mins)
      const overlap = (candRange.start < reg.range.end && candRange.end > reg.range.start);
      if (overlap || gapMs < 15 * 60 * 1000) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      suggestions.push({
        event: candidate,
        range: candRange
      });
    }
  }

  // Sort suggestions by date (upcoming first)
  return suggestions.sort((a, b) => a.range.start.getTime() - b.range.start.getTime());
};

