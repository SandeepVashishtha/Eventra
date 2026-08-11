
/**
 * adds an integer converter.
 */
export function toInteger(value, fallback = 0) {
  const n = parseInt(value, 10);
  return isNaN(n) ? fallback : n;
}

