/**
 * Format date for calendar providers (YYYYMMDDTHHmmssZ)
 */
export const formatCalendarDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
};

/**
 * Generate Google Calendar URL
 */
export const generateGoogleCalendarLink = (event) => {
  const start = formatCalendarDate(event.startDate || event.date);
  const end = formatCalendarDate(event.endDate || event.date);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "Event",
    dates: `${start}/${end}`,
    details: event.description || "",
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Outlook Calendar URL
 */
export const generateOutlookCalendarLink = (event) => {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title || "Event",
    body: event.description || "",
    startdt: event.startDate || event.date,
    enddt: event.endDate || event.date,
    location: event.location || "",
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Generate ICS file content
 */
export const generateICSFile = (event) => {
  const start = formatCalendarDate(event.startDate || event.date);
  const end = formatCalendarDate(event.endDate || event.date);

  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title || "Event"}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR`;
};

/**
 * Download ICS file
 */
export const downloadICS = (event) => {
  const content = generateICSFile(event);

  const blob = new Blob([content], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `${(event.title || "event")
    .replace(/\s+/g, "-")
    .toLowerCase()}.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Calendar providers
 */
export const getCalendarProviders = () => [
  {
    id: "google",
    name: "Google Calendar",
  },
  {
    id: "outlook",
    name: "Outlook Calendar",
  },
  {
    id: "apple",
    name: "Apple Calendar (.ics)",
  },
];

/**
 * Open selected calendar
 */
export const openCalendarProvider = (provider, event) => {
  switch (provider) {
    case "google":
      window.open(
        generateGoogleCalendarLink(event),
        "_blank"
      );
      break;

    case "outlook":
      window.open(
        generateOutlookCalendarLink(event),
        "_blank"
      );
      break;

    case "apple":
      downloadICS(event);
      break;

    default:
      break;
  }
};