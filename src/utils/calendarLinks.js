/**
 * Utility helper to format a raw ISO date string into standard RFC 5545 iCalendar layout
 * Example input: "2026-07-15T18:00:00.000Z" -> Output: "20260715T180000Z"
 */
export const formatICSDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().replace(/-|:|\.\d\d\d/g, "");
};

/**
 * Generates a standard Google Calendar template deep link URL
 */
export const getGoogleCalendarUrl = (event) => {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const text = `&text=${encodeURIComponent(event.title || '')}`;
  const dates = `&dates=${formatICSDate(event.startDateTime)}/${formatICSDate(event.endDateTime)}`;
  const details = `&details=${encodeURIComponent(event.description || '')}`;
  const location = `&location=${encodeURIComponent(event.location || '')}`;
  
  return `${baseUrl}${text}${dates}${details}${location}`;
};

/**
 * Creates a client-side downloadable raw content string for .ics file downloads
 * This serves as a flawless native alternative if backend routing configuration presents issues
 */
export const generateRawICSContent = (event) => {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventra//Event Calendar 1.0//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id || Date.now()}@eventra.com`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${formatICSDate(event.startDateTime)}`,
    `DTEND:${formatICSDate(event.endDateTime)}`,
    `SUMMARY:${(event.title || '').replace(/,/g, '\\,')}`,
    `DESCRIPTION:${(event.description || '').replace(/,/g, '\\,')}`,
    `LOCATION:${(event.location || '').replace(/,/g, '\\,')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};