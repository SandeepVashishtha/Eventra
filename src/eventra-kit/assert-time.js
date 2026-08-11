/**
 * adds a assert-time helper.
 */
export function assertTime(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

