/**
 * adds a check-prop helper.
 */
export function checkProp(value, fallback = 0) {
  return value == null ? fallback : value;
}

