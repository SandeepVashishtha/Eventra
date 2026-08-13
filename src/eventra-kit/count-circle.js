/**
 * adds a count-circle helper.
 */
export function countCircle(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

