/**
 * Checks if a number is a power of five.
 * @param {number} n - The number to check.
 * @returns {boolean} True if n is a power of 5, false otherwise.
 */
export function isPowerOfFive(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const p = Math.round(Math.log(n) / Math.log(5));
  return Math.pow(5, p) === n;
}
