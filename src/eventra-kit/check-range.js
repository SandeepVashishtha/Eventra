/**
 * adds a check-range helper.
 */
export function checkRange(value, predicate = Boolean) {
  return value.filter(predicate);
}

