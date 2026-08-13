/**
 * Computes the base 10 logarithm of a number.
 * @param {number} x - The number.
 * @returns {number} The log10 of x, or 0 for invalid inputs.
 */
export function logBase10(x) {
  if (typeof x !== "number" || x <= 0 || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  return Math.log10(x);
}
