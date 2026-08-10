/**
 * Computes the base 2 logarithm of a number.
 * @param {number} x - The number.
 * @returns {number} The log2 of x, or 0 for invalid inputs.
 */
export function logBase2(x) {
  if (typeof x !== "number" || x <= 0 || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  return Math.log2(x);
}
