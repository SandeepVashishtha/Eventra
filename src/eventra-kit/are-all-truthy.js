
/**
 * adds an all-truthy check.
 */
export function areAllTruthy(array, predicate = Boolean) {
  return array.every(predicate);
}

