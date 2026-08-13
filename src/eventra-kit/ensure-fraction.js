/**
 * adds a ensure-fraction helper.
 */
export function ensureFraction(value, fallback = 0) {
  return value == null ? fallback : value;
}

