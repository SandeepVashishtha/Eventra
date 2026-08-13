/**
 * adds a diff-count helper.
 */
export function diffCount(value, predicate = Boolean) {
  return value.filter(predicate);
}

