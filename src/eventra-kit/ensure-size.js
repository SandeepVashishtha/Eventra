/**
 * adds a ensure-size helper.
 */
export function ensureSize(value, key) {
  return value.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
}

