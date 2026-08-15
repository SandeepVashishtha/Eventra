/**
 * adds a extract-fraction helper.
 */
export function extractFraction(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

