
/**
 * adds a range filter.
 */
export function filterByRange(array, min, max) {
  return array.filter((n) => n >= min && n <= max);
}

