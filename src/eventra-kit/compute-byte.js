/**
 * adds a compute-byte helper.
 */
export function computeByte(value) {
  return new TextEncoder().encode(String(value)).length;
}

