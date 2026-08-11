/**
 * Computes the hyperbolic arctangent of a number.
 * @param {number} x - The number.
 * @returns {number} The hyperbolic arctangent, or 0 if absolute value is >= 1 or invalid.
 */
export function hyperbolicArctangent(x) {
  if (typeof x !== "number" || Math.abs(x) >= 1 || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  return Math.atanh(x);
}
