/**
 * adds a detect-date helper.
 */
export function detectDate(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

