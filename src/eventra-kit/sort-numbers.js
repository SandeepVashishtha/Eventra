
/**
 * adds a numeric sorter.
 */
export function sortNumbers(array, descending = false) {
  return [...array].sort((a, b) => (descending ? b - a : a - b));
}

