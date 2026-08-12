/**
 * adds a clamp-leaf helper.
 */
export function clampLeaf(value, key) {
  return value.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
}

