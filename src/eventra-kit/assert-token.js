/**
 * adds a assert-token helper.
 */
export function assertToken(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

