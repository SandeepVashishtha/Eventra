/**
 * adds a deduplicate-point helper.
 */
export function deduplicatePoint(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

