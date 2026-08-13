/**
 * adds a clamp-key helper.
 */
export function clampKey(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

