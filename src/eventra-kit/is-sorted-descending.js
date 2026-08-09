
/**
 * adds a descending-order check.
 */
export function isSortedDescending(array, comparator = (a, b) => b - a) {
  for (let i = 1; i < array.length; i++) {
    if (comparator(array[i - 1], array[i]) > 0) return false;
  }
  return true;
}

