/**
 * adds a assert-entry helper.
 */
export function assertEntry(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

