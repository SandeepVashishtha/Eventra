
/**
 * adds a date sorter.
 */
export function sortDatesAsc(array) {
  return [...array].sort((a, b) => a.getTime() - b.getTime());
}

