/**
 * adds string capitalization helpers.
 */
export function capitalize(str) {
  if (typeof str !== 'string' || !str) return str || '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().split(/\s+/).map(capitalize).join(' ');
}
