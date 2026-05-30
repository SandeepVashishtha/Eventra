/**
 * CSV Export Utility
 * RFC 4180-compliant CSV generation with proper escaping.
 */

/**
 * Escapes a value for CSV according to RFC 4180.
 * - Wraps in double quotes if the value contains commas, quotes, or newlines
 * - Doubles any internal double quotes
 * @param {*} value
 * @returns {string}
 */
export function escapeCSVValue(value) {
  if (value === null || value === undefined) return "";

  const str = String(value);

  // Check if escaping is needed
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    // Double any embedded quotes and wrap in quotes
    return '"' + str.replace(/"/g, '""'  ) + '"';
  }

  return str;
}

/**
 * Converts an array of objects to a CSV string.
 * @param {Object[]} data - Array of row objects
 * @param {string[]} [columns] - Column keys to include (defaults to all keys from first row)
 * @param {Object} [options]
 * @param {Object} [options.headers] - Map of column key to display header name
 * @returns {string} CSV content
 */
export function toCSV(data, columns, options = {}) {
  if (!data || data.length === 0) return "";

  const cols = columns || Object.keys(data[0]);
  const headerNames = options.headers || {};

  // Header row
  const header = cols.map((c) => escapeCSVValue(headerNames[c] || c)).join(",");

  // Data rows
  const rows = data.map((row) =>
    cols.map((col) => escapeCSVValue(row[col])).join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Triggers a CSV file download in the browser.
 * @param {string} csvContent - CSV string
 * @param {string} [filename] - Download filename (default: "export.csv")
 */
export function downloadCSV(csvContent, filename = "export.csv") {
  // Add BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports event data to a downloadable CSV file.
 * @param {Object[]} events - Array of event objects
 * @param {string} [filename]
 */
export function exportEventsToCSV(events, filename = "events.csv") {
  const columns = ["title", "date", "location", "category", "status", "attendees"];
  const headers = {
    title: "Event Title",
    date: "Date",
    location: "Location",
    category: "Category",
    status: "Status",
    attendees: "Attendees",
  };

  const csv = toCSV(events, columns, { headers });
  downloadCSV(csv, filename);
}
