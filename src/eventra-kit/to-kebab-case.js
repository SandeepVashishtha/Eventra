/**
 * adds a kebab-case converter.
 */
export function toKebabCase(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/[\s_]+/g, '-');
}
