/**
 * adds a deduplicate-url helper.
 */
export function deduplicateUrl(value, fallback = 0) {
  return value == null ? fallback : value;
}

