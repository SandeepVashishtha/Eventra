/**
 * adds a detect-slice helper.
 */
export function detectSlice(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

