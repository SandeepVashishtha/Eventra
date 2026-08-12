/**
 * adds a check-heap helper.
 */
export function checkHeap(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

