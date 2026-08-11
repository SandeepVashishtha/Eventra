/**
 * Computes the hyperbolic cosine of a number.
 * @param {number} x - The number to compute the hyperbolic cosine of.
 * @returns {number} The hyperbolic cosine.
 */
export function hyperbolicCosine(x) {
  if (typeof x !== "number" || isNaN(x) || !isFinite(x)) {
    return 1;
  }
  return Math.cosh(x);
}
