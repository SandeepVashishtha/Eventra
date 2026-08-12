
import { useCallback } from 'react';

const CSV_FORMULA_TRIGGERS = /^[=+\-@\t\r]/;

// Prevent CSV/formula injection: cells starting with =, +, -, @, Tab, or CR
// are treated as formulas by spreadsheet apps. A leading single quote forces
// the spreadsheet to render the value as plain text.
const sanitizeCsvCell = (value) => {
  const cell = value === null || value === undefined ? '' : String(value);
  return CSV_FORMULA_TRIGGERS.test(cell) ? `'${cell}` : cell;
};

export const useCSVExport = () => {
  const exportToCSV = useCallback((data, filename = 'export.csv') => {
    if (!data || !data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          return `"${sanitizeCsvCell(row[header]).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return { exportToCSV };
};
