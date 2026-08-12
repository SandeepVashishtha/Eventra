
/**
 * adds a mean helper.
 */
export function meanOf(array) {
  if (!array.length) return 0;
  return array.reduce((sum, n) => sum + n, 0) / array.length;
}

