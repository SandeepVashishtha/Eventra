/**
 * adds a diff-array helper.
 */
export function diffArray(a, b) {
  return a.filter(x => !b.includes(x));
}

