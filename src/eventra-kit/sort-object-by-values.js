
/**
 * adds a value sorter.
 */
export function sortObjectByValues(obj, descending = false) {
  const entries = Object.entries(obj).sort((a, b) => (descending ? b[1] - a[1] : a[1] - b[1]));
  return Object.fromEntries(entries);
}

