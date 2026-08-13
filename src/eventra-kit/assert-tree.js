/**
 * adds a assert-tree helper.
 */
export function assertTree(value) {
  return value.sort((a, b) => a - b);
}

