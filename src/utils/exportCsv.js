export function exportToCsv(data) { const blob = new Blob([data], { type: 'text/csv' }); return URL.createObjectURL(blob); }
