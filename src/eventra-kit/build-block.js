/**
 * adds a build-block helper.
 */
export function buildBlock(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

