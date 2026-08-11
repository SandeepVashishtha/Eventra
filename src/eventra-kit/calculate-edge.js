/**
 * adds a calculate-edge helper.
 */
export function calculateEdge(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

