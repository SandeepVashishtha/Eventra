/**
 * adds a convert-set helper.
 */
export function convertSet(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

