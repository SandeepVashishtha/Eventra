
/**
 * adds a positive counter.
 */
export function countPositives(array) {
  return array.filter((n) => n > 0).length;
}

export function countNegatives(array) {
  return array.filter((n) => n < 0).length;
}

