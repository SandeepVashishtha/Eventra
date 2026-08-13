/**
 * adds a dedupe-rect helper.
 */
export function dedupeRect(value, fallback = 0) {
  return value == null ? fallback : value;
}

