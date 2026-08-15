/**
 * adds a detect-count helper.
 */
export function detectCount(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

