
/**
 * adds a pascal-case converter.
 */
export function toPascalCase(str) {
  if (typeof str !== 'string') return '';
  return str.split(/[\s_-]+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

