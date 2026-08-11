
/**
 * adds a parity helper.
 */
export function parityBit(value) {
  let count = 0;
  let n = value;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count % 2;
}

