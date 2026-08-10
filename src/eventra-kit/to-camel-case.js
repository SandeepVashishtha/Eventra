/**
 * adds case-conversion helpers.
 */
export function toCamelCase(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join('');
}

export function toSnakeCase(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase().replace(/[\s-]+/g, '_');
}
