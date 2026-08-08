export function sanitizeFilename(name) {
  if (!name || typeof name !== "string") return "file";
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

const CSV_FORMULA_TRIGGERS = /^[=+\-@\t\r]/;

// Prevent CSV/formula injection: spreadsheet applications treat cells that
// start with =, +, -, @, Tab, or Carriage Return as formula directives.
// Prefixing those cells with a single quote makes the spreadsheet render the
// value as plain text instead of executing it (e.g. =HYPERLINK("http://evil.com","x")).
const sanitizeCsvCell = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  return CSV_FORMULA_TRIGGERS.test(str) ? `'${str}` : str;
};

export function exportToCSV(data, filename) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const escape = sanitizeCsvCell(row[header]).replace(/"/g, '""');
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

  // Sync revokeObjectURL fixes memory leak when tab closes quickly
  URL.revokeObjectURL(url);
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

  // Sync revokeObjectURL fixes memory leak when tab closes quickly
  URL.revokeObjectURL(url);
}