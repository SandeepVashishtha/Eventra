/**
 * adds a ensure-set helper.
 */
export function ensureSet(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

