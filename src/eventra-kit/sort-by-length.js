
/**
 * adds a length sorter.
 */
export function sortByLength(array, descending = false) {
  return [...array].sort((a, b) => (descending ? b.length - a.length : a.length - b.length));
}

