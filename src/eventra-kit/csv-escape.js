/**
 * adds a csv escaping helper.
 */
export function csvEscape(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsvRow(values) {
  return values.map(csvEscape).join(',');
}
