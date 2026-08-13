/**
 * adds a create-fraction helper.
 */
export function createFraction(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

