
/**
 * adds a descending sorter.
 */
export function reverseSort(array, key) {
  const sorted = sortAlphabetically(array, key);
  return sorted.reverse();
}

