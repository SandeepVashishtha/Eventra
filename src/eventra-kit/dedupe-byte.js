/**
 * adds a dedupe-byte helper.
 */
export function dedupeByte(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

