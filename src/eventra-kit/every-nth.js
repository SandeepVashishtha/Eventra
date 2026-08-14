
/**
 * adds an nth-item helper.
 */
export function everyNth(array, n = 1) {
  if (!Number.isInteger(n) || n < 1) {
    throw new TypeError('n must be a positive integer');
  }
  return array.filter((_, i) => i % n === 0);
}

