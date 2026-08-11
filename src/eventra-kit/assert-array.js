/**
 * adds a assert-array helper.
 */
export function assertArray(value, fallback = 0) {
  return value == null ? fallback : value;
}

