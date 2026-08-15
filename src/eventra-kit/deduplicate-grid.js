/**
 * adds a deduplicate-grid helper.
 */
export function deduplicateGrid(value, key) {
  return value.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
}

