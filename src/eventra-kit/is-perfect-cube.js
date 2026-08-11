/**
 * Checks if a number is a perfect cube.
 * @param {number} n - The number to check.
 * @returns {boolean} True if n is a perfect cube, false otherwise.
 */
export function isPerfectCube(n) {
  if (typeof n !== "number" || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const c = Math.round(Math.cbrt(n));
  return c * c * c === n;
}
