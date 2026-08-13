/**
 * adds a dedupe-item helper.
 */
export function dedupeItem(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

