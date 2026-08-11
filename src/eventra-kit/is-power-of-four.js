/**
 * Checks if a number is a power of four.
 * @param {number} n - The number to check.
 * @returns {boolean} True if n is a power of 4, false otherwise.
 */
export function isPowerOfFour(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const p = Math.round(Math.log(n) / Math.log(4));
  return Math.pow(4, p) === n;
}
