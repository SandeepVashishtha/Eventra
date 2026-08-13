/**
 * adds a convert-slice helper.
 */
export function convertSlice(value) {
  return value.every((item) => Boolean(item));
}

