/**
 * adds a clamp-slice helper.
 */
export function clampSlice(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

