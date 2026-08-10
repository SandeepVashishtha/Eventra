/**
 * Computes the natural logarithm of a number.
 * @param {number} x - The number.
 * @returns {number} The natural logarithm of x, or 0 for invalid inputs.
 */
export function naturalLog(x) {
  if (typeof x !== "number" || x <= 0 || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  return Math.log(x);
}
