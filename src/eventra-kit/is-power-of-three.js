/**
 * Checks if a number is a power of three.
 * @param {number} n - The number to check.
 * @returns {boolean} True if n is a power of 3, false otherwise.
 */
export function isPowerOfThree(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const p = Math.round(Math.log(n) / Math.log(3));
  return Math.pow(3, p) === n;
}
