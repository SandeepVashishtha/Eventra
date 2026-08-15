/**
 * adds a estimate-circle helper.
 */
export function estimateCircle(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

