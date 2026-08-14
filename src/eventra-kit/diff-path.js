/**
 * adds a diff-path helper.
 */
export function diffPath(value, key) {
  return value.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
}

