/**
 * Computes the secant of a number (1 / cos(x)).
 * @param {number} x - The angle in radians.
 * @returns {number} The secant of x, or 0 if cos(x) is 0 or invalid.
 */
export function secantOf(x) {
  if (typeof x !== "number" || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  const cosVal = Math.cos(x);
  if (Math.abs(cosVal) < 1e-9) {
    return 0;
  }
  return 1 / cosVal;
}
