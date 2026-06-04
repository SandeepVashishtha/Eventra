/**
 * exportCsv.js
 *
 * Utilities for exporting application data as downloadable CSV files.
 *
 * Security notes
 * ──────────────
 * sanitizeCSVField prevents CSV injection (also called formula injection):
 * spreadsheet applications treat values starting with =, +, -, @, Tab, or
 * CR as formula directives. Prefixing those values with a single quote
 * causes the spreadsheet to treat the cell as plain text.
 *
 * exportAttendeesToCSV sanitizes the filename argument to prevent path
 * traversal characters from appearing in the download attribute.
 */

/**
 * Escapes a single CSV field value so it is safe for use in a CSV file.
 *
 * Rules applied:
 * 1. CSV-injection guard: values starting with a formula trigger character
 * (=, +, -, @, Tab \t, Carriage Return \r) are prefixed with a single
 * quote so spreadsheets render them as plain text.
 * 2. Double-quote escaping: any " inside the value is doubled ("") per RFC 4180.
 * 3. The field is always wrapped in double quotes.
 *
 * @param {*} field - Raw field value (will be coerced to string)
 * @returns {string} Quoted, escaped CSV field
 */
const sanitizeCSVField = (field) => {
  const value = String(field ?? "");
  // Prefix formula-trigger characters to prevent CSV injection
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
};

/**
 * exportAttendeesToCSV
 *
 * Generates a CSV file from the provided attendee list and triggers a
 * browser download.
 *
 * Bug fixes applied in this version
 * ──────────────────────────────────
 * 1. Blob URL never revoked (memory leak):
 * The previous implementation used setTimeout(..., 100) to revoke the
 * object URL. If the user navigated away or closed the tab before the
 * 100 ms timer fired, URL.revokeObjectURL() was never called, leaking
 * the allocated Blob memory for the lifetime of the process.
 *
 * Fix: revokeObjectURL() is now called synchronously in the finally block,
 * immediately after link.click(). The download is already queued by the
 * browser before this line runs — the URL does not need to remain alive
 * after click() returns.
 *
 * 2. Unsafe filename:
 * The previous implementation accepted the filename argument without
 * sanitization. A caller passing a filename containing path separators
 * or shell metacharacters (e.g. "../../../etc/passwd.csv") could produce
 * unexpected download names across operating systems.
 *
 * Fix: The filename is sanitized by stripping all OS path-separator and
 * reserved characters (/ \ : * ? " < > |) before it is used.
 *
 * @param {Array<object>} attendees - List of attendee objects to export
 * @param {string} [filename]       - Desired download filename (will be sanitized)
 */
export const exportAttendeesToCSV = (attendees, filename = "event-attendees.csv") => {
  if (!attendees || attendees.length === 0) {
    return;
  }

  // Sanitize the filename: strip OS reserved characters and path separators.
  // Fall back to a safe default if sanitization produces an empty string.
  const safeFilename = filename.replace(/[/\\:*?"<>|]/g, "_").trim() || "export.csv";

  const headers = ["Name", "Email", "Registration Date", "Ticket Type"];

  const rows = attendees.map((attendee) => [
    attendee.name || "",
    attendee.email || "",
    attendee.registrationDate || "",
    attendee.ticketType || "General",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(sanitizeCSVField).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);

    // Revoke synchronously — the download has already been queued by the
    // browser when click() returns. No setTimeout needed.
    //
    // revokeObjectURL removes the blob: URL mapping but does NOT free the
    // underlying Blob memory while the browser's download manager still
    // holds an internal reference to it. The "Firefox/Safari race condition"
    // sometimes cited to justify setTimeout is a misconception: Blob URLs
    // reference in-memory data (not file pointers), and the browser retains
    // its own reference for the lifetime of the download regardless of when
    // the URL is revoked. Deferring revocation only reintroduces the memory
    // leak this code was written to fix.
    window.URL.revokeObjectURL(url);
  }
};

/**
 * exportSurveyToCSV
 *
 * Generates a safe CSV file from the provided survey questions and dynamic response logs,
 * fully escaped per RFC 4180 and guarded against CSV/formula injection.
 *
 * @param {Array<object>} questions  - Array of active survey question objects
 * @param {Array<object>} responses  - Array of attendee response submission objects
 * @param {string} surveyTitle       - Raw title of the survey (will be sanitized)
 */
export const exportSurveyToCSV = (questions, responses, surveyTitle = "Survey") => {
  if (!questions || questions.length === 0 || !responses || responses.length === 0) {
    return;
  }

  // Sanitize the filename to strip OS path separators and reserved chars
  const sanitizedTitle = surveyTitle.replace(/[/\\:*?"<>|]/g, "_").trim() || "Survey";
  const dateStr = new Date().toISOString().split("T")[0];
  const safeFilename = `feedback-${sanitizedTitle}-${dateStr}.csv`;

  // Columns: Timestamp followed by each question prompt
  const headers = ["Timestamp", ...questions.map((q) => q.questionText || `Question (${q.type})`)];

  // Rows: Each anonymous attendee submission
  const rows = responses.map((resp) => [
    resp.timestamp || "",
    ...questions.map((q) => resp.answers[q.id] ?? ""),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(sanitizeCSVField).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

/**
 * exportEventsToCSV
 *
 * Generates a safe CSV file from the provided events list, fully escaped per
 * RFC 4180 and guarded against CSV/formula injection.
 *
 * @param {Array<object>} events      - List of event objects to export
 * @param {string} [filename]        - Desired download filename (will be sanitized)
 */
export const exportEventsToCSV = (events, filename = "eventra-events.csv") => {
  if (!events || events.length === 0) {
    return;
  }

  // Ensure the filename ends with .csv, and sanitize path/special characters
  let safeFilename = filename.replace(/[/\\:*?"<>|]/g, "_").trim();
  if (!safeFilename.endsWith(".csv")) {
    safeFilename = `${safeFilename}.csv`;
  }
  if (safeFilename === ".csv") {
    safeFilename = "export.csv";
  }

  const columns = [
    { header: "id", fn: (e) => e.id ?? "" },
    { header: "title", fn: (e) => e.title ?? "" },
    { header: "date", fn: (e) => e.date ?? "" },
    { header: "time", fn: (e) => e.time ?? e.startTime ?? "" },
    { header: "location", fn: (e) => e.location ?? "" },
    { header: "type", fn: (e) => e.type ?? e.category ?? "" },
    { header: "status", fn: (e) => e.status ?? "" },
    { header: "organizer", fn: (e) => e.organizer ?? e.organizerName ?? "" },
    { header: "description", fn: (e) => e.description ?? e.shortDescription ?? "" },
    {
      header: "url",
      fn: (e) =>
        e.id
          ? `${typeof window !== "undefined" && window.location ? window.location.origin : ""}/events/${e.id}`
          : "",
    },
  ];

  const headers = columns.map((c) => c.header);
  const rows = events.map((event) => columns.map((c) => c.fn(event)));

  const csvContent = [headers, ...rows]
    .map((row) => row.map(sanitizeCSVField).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};