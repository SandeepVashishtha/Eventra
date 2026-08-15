/**
 * adds a diff-space helper.
 */
export function diffSpace(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

