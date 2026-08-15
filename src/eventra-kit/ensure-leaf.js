/**
 * adds a ensure-leaf helper.
 */
export function ensureLeaf(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

