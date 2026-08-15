/**
 * adds a extract-object helper.
 */
export function extractObject(value, fallback = 0) {
  return value == null ? fallback : value;
}

