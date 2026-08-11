
/**
 * adds a snake-to-kebab converter.
 */
export function toKebabFromSnake(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/_/g, '-').toLowerCase();
}

