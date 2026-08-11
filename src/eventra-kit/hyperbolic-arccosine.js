/**
 * Computes the hyperbolic arccosine of a number.
 * @param {number} x - The number.
 * @returns {number} The hyperbolic arccosine, or 0 if less than 1 or invalid.
 */
export function hyperbolicArccosine(x) {
  if (typeof x !== "number" || x < 1 || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  return Math.acosh(x);
}
