/**
 * adds a build-array helper.
 */
export function buildArray(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

