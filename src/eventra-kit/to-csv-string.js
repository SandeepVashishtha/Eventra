
/**
 * adds an array-of-objects csv helper.
 */
export function toCsvString(rows, columns) {
  if (!rows.length) return '';
  const cols = columns || Object.keys(rows[0]);
  const escapeCell = (v) => {
    const str = v == null ? '' : String(v);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const header = cols.map(escapeCell).join(',');
  const body = rows.map(row => cols.map(c => escapeCell(row[c])).join(','));
  return [header, ...body].join('\n');
}

