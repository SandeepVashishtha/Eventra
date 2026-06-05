/**
 * Sanitizes a string to be safe for use as a filename.
 * Replaces all non-alphanumeric characters with underscores.
 * @param {string} name - The raw filename string.
 * @returns {string} A lowercase, sanitized filename string.
 */
export function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

/**
 * Triggers a browser download for a given blob URL.
 * Cleans up the object URL after 100ms to free browser memory.
 * @param {string} url - The object URL to download.
 * @param {string} filename - The name of the file to download (with extension).
 */
function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Free up browser memory after the download triggers.
  // The 100ms delay ensures the browser starts the download before the blob is destroyed.
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Exports an array of objects to a CSV file and triggers a browser download.
 * Adds a UTF-8 BOM so Microsoft Excel correctly detects UTF-8 encoding
 * and displays non-ASCII characters (Hindi, accented, emoji) properly.
 * @param {Object[]} data - Array of objects to export.
 * @param {string} filename - The base filename (without extension).
 */
export function exportToCSV(data, filename) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const escape = ('' + (row[header] ?? '')).replace(/"/g, '""');
      return `"${escape}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob(['\uFEFF', csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${sanitizeFilename(filename)}.csv`);
}

/**
 * Exports data to a pretty-printed JSON file and triggers a browser download.
 * @param {*} data - The data to serialize and export.
 * @param {string} filename - The base filename (without extension).
 */
export function exportToJSON(data, filename) {
  if (data === null || data === undefined) return;
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${sanitizeFilename(filename)}.json`);
}