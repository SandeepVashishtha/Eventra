
/**
 * adds a float converter.
 */
export function toFloat(value, fallback = 0) {
  const n = parseFloat(value);
  return isNaN(n) ? fallback : n;
}

