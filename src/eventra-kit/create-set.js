/**
 * adds a create-set helper.
 */
export function createSet(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

