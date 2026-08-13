/**
 * adds a compute-count helper.
 */
export function computeCount(value, predicate = Boolean) {
  return value.filter(predicate);
}

