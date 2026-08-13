/**
 * adds a dedupe-char helper.
 */
export function dedupeChar(value, key) {
  return value.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
}

