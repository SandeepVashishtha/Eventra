
/**
 * adds a unique-sorted helper.
 */
export function uniqueSorted(array, comparator = (a, b) => a - b) {
  return [...new Set(array)].sort(comparator);
}

