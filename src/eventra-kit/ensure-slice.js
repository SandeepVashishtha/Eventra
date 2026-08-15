/**
 * adds a ensure-slice helper.
 */
export function ensureSlice(value) {
  return value.every((item) => Boolean(item));
}

