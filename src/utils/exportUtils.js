export function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

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
  // Add UTF-8 BOM so Microsoft Excel correctly detects UTF-8 encoding
  // and displays non-ASCII characters (Hindi, accented, emoji) properly.
  const blob = new Blob(['\uFEFF', csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${sanitizeFilename(filename)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 🔥 FIX: Free up browser memory after download triggers
  // (100ms delay ensures the browser starts the download before the blob is destroyed)
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function exportToJSON(data, filename) {
  if (!data || !data.length) return;
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${sanitizeFilename(filename)}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 🔥 FIX: Free up browser memory after download triggers
  setTimeout(() => URL.revokeObjectURL(url), 100);
}