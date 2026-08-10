
/**
 * adds a type checker.
 */
export function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

