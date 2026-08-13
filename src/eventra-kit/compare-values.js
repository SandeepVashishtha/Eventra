
/**
 * adds a value comparator.
 */
export function compareValues(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

