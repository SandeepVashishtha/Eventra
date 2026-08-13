/**
 * Computes the hyperbolic sine of a number.
 * @param {number} x - The number to compute the hyperbolic sine of.
 * @returns {number} The hyperbolic sine.
 */
export function hyperbolicSine(x) {
  if (typeof x !== "number" || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  return Math.sinh(x);
}
