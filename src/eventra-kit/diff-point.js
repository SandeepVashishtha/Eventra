/**
 * adds a diff-point helper.
 */
export function diffPoint(value) {
  return value.every((item) => Boolean(item));
}

