/**
 * Computes the nth root of a number.
 * @param {number} x - The base value.
 * @param {number} n - The root exponent.
 * @returns {number} The nth root, or 0 if invalid/imaginary root.
 */
export function nthRoot(x, n) {
  if (typeof x !== "number" || typeof n !== "number" || isNaN(x) || isNaN(n) || n <= 0) {
    return 0;
  }
  if (x < 0 && n % 2 === 0) {
    return 0;
  }
  const sign = x < 0 ? -1 : 1;
  return sign * Math.pow(Math.abs(x), 1 / n);
}
