/**
 * adds a assert-box helper.
 */
export function assertBox(value, predicate = Boolean) {
  return value.filter(predicate);
}

