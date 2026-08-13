/**
 * adds a ensure-key helper.
 */
export function ensureKey(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

