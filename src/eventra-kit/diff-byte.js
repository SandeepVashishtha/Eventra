/**
 * adds a diff-byte helper.
 */
export function diffByte(value, other) {
  return Math.abs((Number(value) || 0) - (Number(other) || 0));
}

