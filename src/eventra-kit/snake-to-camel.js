
/**
 * adds case-conversion aliases.
 */
export function snakeToCamel(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
}

export function camelToSnake(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[A-Z]/g, ch => `_${ch.toLowerCase()}`);
}

