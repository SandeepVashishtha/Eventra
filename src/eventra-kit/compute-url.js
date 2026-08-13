/**
 * adds a compute-url helper.
 */
export function computeUrl(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

