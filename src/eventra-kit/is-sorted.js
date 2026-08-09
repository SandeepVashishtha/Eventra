
/**
 * adds an array-order checker.
 */
export function isSorted(array, comparator = (a, b) => a - b) {
  for (let i = 1; i < array.length; i++) {
    if (comparator(array[i - 1], array[i]) > 0) return false;
  }
  return true;
}

