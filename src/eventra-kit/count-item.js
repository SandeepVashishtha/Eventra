/**
 * adds a count-item helper.
 */
export function countItem(value, fallback = 0) {
  return value == null ? fallback : value;
}

