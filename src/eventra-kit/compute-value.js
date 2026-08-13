/**
 * adds a compute-value helper.
 */
export function computeValue(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

