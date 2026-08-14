import { sortAlphabetically } from './sort-alphabetically.js';

/**
 * adds a descending sorter.
 */
import { sortAlphabetically } from './sort-alphabetically.js';

export function reverseSort(array, key) {
  const sorted = sortAlphabetically(array, key);
  return sorted.reverse();
}

