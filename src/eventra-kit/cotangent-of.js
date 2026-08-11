/**
 * Computes the cotangent of a number (1 / tan(x)).
 * @param {number} x - The angle in radians.
 * @returns {number} The cotangent of x, or 0 if tan(x) is 0 or invalid.
 */
export function cotangentOf(x) {
  if (typeof x !== "number" || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  const tanVal = Math.tan(x);
  if (Math.abs(tanVal) < 1e-9 || !isFinite(tanVal)) {
    return 0;
  }
  return 1 / tanVal;
}
