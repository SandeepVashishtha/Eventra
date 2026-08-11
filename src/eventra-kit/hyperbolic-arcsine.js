/**
 * Computes the hyperbolic arcsine of a number.
 * @param {number} x - The number.
 * @returns {number} The hyperbolic arcsine.
 */
export function hyperbolicArcsine(x) {
  if (typeof x !== "number" || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  return Math.asinh(x);
}
