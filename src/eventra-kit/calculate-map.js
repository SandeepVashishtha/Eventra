/**
 * adds a calculate-map helper.
 */
export function calculateMap(value, fallback = 0) {
  return value == null ? fallback : value;
}

