/**
 * adds a assert-field helper.
 */
export function assertField(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

