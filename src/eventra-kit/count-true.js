
/**
 * adds a truthy counter.
 */
export function countTrue(array, predicate = Boolean) {
  return array.filter(predicate).length;
}

