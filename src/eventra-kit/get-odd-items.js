
/**
 * adds an odd-index filter.
 */
export function getOddItems(array) {
  return array.filter((_, i) => i % 2 === 1);
}

export function getEvenItems(array) {
  return array.filter((_, i) => i % 2 === 0);
}

