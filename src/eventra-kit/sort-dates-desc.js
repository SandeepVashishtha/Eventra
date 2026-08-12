
/**
 * adds a date sorter.
 */
export function sortDatesDesc(array) {
  return [...array].sort((a, b) => b.getTime() - a.getTime());
}

