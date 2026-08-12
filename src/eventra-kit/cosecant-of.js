/**
 * Computes the cosecant of a number (1 / sin(x)).
 * @param {number} x - The angle in radians.
 * @returns {number} The cosecant of x, or 0 if sin(x) is 0 or invalid.
 */
export function cosecantOf(x) {
  if (typeof x !== "number" || isNaN(x) || !isFinite(x)) {
    return 0;
  }
  const sinVal = Math.sin(x);
  if (Math.abs(sinVal) < 1e-9) {
    return 0;
  }
  return 1 / sinVal;
}
