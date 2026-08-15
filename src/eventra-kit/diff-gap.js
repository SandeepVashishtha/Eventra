/**
 * adds a diff-gap helper.
 */
export function diffGap(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

