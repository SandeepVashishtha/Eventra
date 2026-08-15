/**
 * adds a estimate-item helper.
 */
export function estimateItem(value, fallback = 0) {
  return value == null ? fallback : value;
}

