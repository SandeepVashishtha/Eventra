/**
 * Checks if a number is a perfect square.
 * @param {number} n - The number to check.
 * @returns {boolean} True if n is a perfect square, false otherwise.
 */
export function isPerfectSquare(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const s = Math.round(Math.sqrt(n));
  return s * s === n;
}
