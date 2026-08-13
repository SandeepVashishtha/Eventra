
/**
 * adds a predicate counter.
 */
export function countWhere(array, predicate) {
  return array.filter(predicate).length;
}

