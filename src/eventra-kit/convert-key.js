/**
 * adds a convert-key helper.
 */
export function convertKey(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

