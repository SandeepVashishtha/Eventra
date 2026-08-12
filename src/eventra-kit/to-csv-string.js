
/**
 * adds an array-of-objects csv helper.
 */
export function toCsvString(rows, columns) {
  if (!rows.length) return '';
  const cols = columns || Object.keys(rows[0]);
  const header = cols.join(',');
  const body = rows.map(row => cols.map(c => {
    const value = row[c];
    const str = value == null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(','));
  return [header, ...body].join('\n');
}

