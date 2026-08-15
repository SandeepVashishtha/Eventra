/**
 * adds a detect-space helper.
 */
export function detectSpace(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

