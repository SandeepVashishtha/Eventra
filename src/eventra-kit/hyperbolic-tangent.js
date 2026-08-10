/**
 * Computes the hyperbolic tangent of a number.
 * @param {number} x - The number to compute the hyperbolic tangent of.
 * @returns {number} The hyperbolic tangent.
 */
export function hyperbolicTangent(x) {
  if (typeof x !== "number" || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  return Math.tanh(x);
}
