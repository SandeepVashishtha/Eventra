/**
 * exportEvents.js
 *
 * Utilities for exporting event lists to CSV so users can open them in
 * spreadsheets or import them into calendar apps.
 *
 * WHY: Users want to keep a local record of their bookmarked/registered events
 * for offline reference or to share with colleagues without needing to be logged
 * in to Eventra.
 */

/**
 * Escapes a single CSV cell value, wrapping it in double-quotes and escaping
 * any existing double-quotes by doubling them.
 *
 * @param {*} value
 * @returns {string}
 */
function escapeCsvCell(value) {
  const str = String(value ?? "");
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Converts an array of event objects into a CSV string.
 *
 * The columns exported are a curated subset — not all fields are included since
 * many are UI-only (image URLs, color codes, etc.) that are not useful offline.
 *
 * @param {Array<Object>} events
 * @returns {string} CSV text with a header row
 */
export function eventsToCSV(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return "id,title,date,time,location,type,status,organizer,description,url\n";
  }

  const columns = [
    { header: "id",          fn: (e) => e.id ?? "" },
    { header: "title",       fn: (e) => e.title ?? "" },
    { header: "date",        fn: (e) => e.date ?? "" },
    { header: "time",        fn: (e) => e.time ?? e.startTime ?? "" },
    { header: "location",    fn: (e) => e.location ?? "" },
    { header: "type",        fn: (e) => e.type ?? e.category ?? "" },
    { header: "status",      fn: (e) => e.status ?? "" },
    { header: "organizer",   fn: (e) => e.organizer ?? e.organizerName ?? "" },
    { header: "description", fn: (e) => e.description ?? e.shortDescription ?? "" },
    { header: "url",         fn: (e) => e.id ? `${window.location.origin}/events/${e.id}` : "" },
  ];

  const header = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const rows = events.map((event) =>
    columns.map((c) => escapeCsvCell(c.fn(event))).join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Triggers a browser download of the provided events as a CSV file.
 *
 * Uses the Blob API so no server round-trip is required — the file is
 * generated entirely in the browser.
 *
 * @param {Array<Object>} events        - Array of event objects to export
 * @param {string}        [filename]    - Download filename without extension (default: "eventra-events")
 */
export function exportEventsToCSV(events, filename = "eventra-events") {
  const csv = eventsToCSV(events);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  // Sanitise filename: keep alphanumerics, hyphens, underscores
  const safe = filename.replace(/[^a-z0-9\-_]/gi, "_").toLowerCase();
  link.download = `${safe}.csv`;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the object URL after the download is triggered
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
