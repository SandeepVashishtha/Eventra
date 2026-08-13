/**
 * adds a count-uri helper.
 */
export function countUri(value, key) {
  return value.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
}

