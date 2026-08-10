/**
 * Checks if a number is a triangular number.
 * @param {number} x - The number to check.
 * @returns {boolean} True if x is a triangular number, false otherwise.
 */
export function isTriangularNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  const val = 8 * x + 1;
  const s = Math.round(Math.sqrt(val));
  return s * s === val;
}
