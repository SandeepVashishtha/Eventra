/**
 * adds a diff-value helper.
 */
export function diffValue(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

