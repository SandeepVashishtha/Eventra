/**
 * adds a dedupe-slice helper.
 */
export function dedupeSlice(value, fallback = 0) {
  return value == null ? fallback : value;
}

