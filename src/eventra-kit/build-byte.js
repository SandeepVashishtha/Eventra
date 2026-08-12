/**
 * adds a build-byte helper.
 */
export function buildByte(value) {
  return value.sort((a, b) => b - a);
}

