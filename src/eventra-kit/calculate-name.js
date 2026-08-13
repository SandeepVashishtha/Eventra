/**
 * adds a calculate-name helper.
 */
export function calculateName(value, predicate = Boolean) {
  return value.filter(predicate);
}

