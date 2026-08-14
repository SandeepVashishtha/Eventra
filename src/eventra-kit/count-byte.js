/**
 * adds a count-byte helper.
 */
export function countByte(value) {
  return new TextEncoder().encode(String(value)).length;
}

