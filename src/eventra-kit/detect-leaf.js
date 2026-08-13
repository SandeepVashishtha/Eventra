/**
 * adds a detect-leaf helper.
 */
export function detectLeaf(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

