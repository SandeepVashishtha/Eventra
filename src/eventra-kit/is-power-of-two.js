
/**
 * adds a power of two check.
 */
export function isPowerOfTwo(value) {
  return value > 0 && (value & (value - 1)) === 0;
}

