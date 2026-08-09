const formatCalendarDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
};

/**
 * Create an iCalendar (.ics) file for the registered event.
 */
export const addEventToCalendar = (registration) => {
  if (!registration) return;

  const {
    eventName = "Event",
    eventDate,
    eventTime = "00:00",
    venue = "",
    meetingLink = "",
  } = registration;

  if (!eventDate) {
    console.warn("Event date is required for calendar export.");
    return;
  }

  const startDate = new Date(
    `${eventDate} ${eventTime}`
  );

  if (Number.isNaN(startDate.getTime())) {
    console.warn("Invalid event date or time.");
    return;
  }

  const endDate = new Date(
    startDate.getTime() + 60 * 60 * 1000
  );

  const location = meetingLink || venue;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventra//Registration Confirmation//EN",
    "BEGIN:VEVENT",
    `UID:${registration.registrationId || Date.now()}@eventra`,
    `DTSTAMP:${formatCalendarDate(new Date())}`,
    `DTSTART:${formatCalendarDate(startDate)}`,
    `DTEND:${formatCalendarDate(endDate)}`,
    `SUMMARY:${escapeICSValue(eventName)}`,
    `LOCATION:${escapeICSValue(location)}`,
    `DESCRIPTION:${escapeICSValue(
      `Registration ID: ${
        registration.registrationId || "N/A"
      }`
    )}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });

  downloadFile(blob, "event-registration.ics");
};

/**
 * Download a registration confirmation file.
 */
export const downloadConfirmation = (
  registration
) => {
  if (!registration) return;

  const {
    eventName = "Event",
    registrationId = "N/A",
    eventDate = "N/A",
    eventTime = "N/A",
    venue = "N/A",
    meetingLink = "",
    status = "Registered",
  } = registration;

  const confirmationHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Event Registration Confirmation</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            padding: 40px;
          }

          .container {
            max-width: 700px;
            margin: auto;
            background: white;
            padding: 35px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
          }

          h1 {
            color: #16a34a;
            margin-bottom: 10px;
          }

          h2 {
            margin-top: 30px;
          }

          .registration-id {
            background: #eef2ff;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
          }

          .row {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
          }

          .label {
            color: #64748b;
            font-size: 13px;
          }

          .value {
            font-weight: bold;
            margin-top: 4px;
          }

          .status {
            color: #16a34a;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <h1>Registration Successful!</h1>

          <p>
            Your registration for the following event has been confirmed.
          </p>

          <div class="registration-id">
            <div class="label">Registration ID</div>
            <div class="value">
              ${escapeHTML(registrationId)}
            </div>
          </div>

          <h2>${escapeHTML(eventName)}</h2>

          <div class="row">
            <div class="label">Date</div>
            <div class="value">
              ${escapeHTML(eventDate)}
            </div>
          </div>

          <div class="row">
            <div class="label">Time</div>
            <div class="value">
              ${escapeHTML(eventTime)}
            </div>
          </div>

          <div class="row">
            <div class="label">
              ${meetingLink ? "Meeting Link" : "Venue"}
            </div>

            <div class="value">
              ${
                meetingLink
                  ? escapeHTML(meetingLink)
                  : escapeHTML(venue)
              }
            </div>
          </div>

          <div class="row">
            <div class="label">
              Registration Status
            </div>

            <div class="value status">
              ${escapeHTML(status)}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(
    [confirmationHTML],
    {
      type: "text/html;charset=utf-8",
    }
  );

  downloadFile(
    blob,
    "event-registration-confirmation.html"
  );
};

/**
 * Download a Blob as a file.
 */
export const downloadFile = (
  blob,
  fileName
) => {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Escape values used in iCalendar content.
 */
const escapeICSValue = (value) => {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
};

/**
 * Escape HTML values before inserting them
 * into the confirmation document.
 */
const escapeHTML = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};