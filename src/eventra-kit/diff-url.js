/**
 * adds a diff-url helper.
 */
export function diffUrl(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

