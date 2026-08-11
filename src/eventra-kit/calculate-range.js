/**
 * adds a calculate-range helper.
 */
export function calculateRange(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

