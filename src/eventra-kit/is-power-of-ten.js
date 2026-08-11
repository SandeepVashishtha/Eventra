/**
 * Checks if a number is a power of ten.
 * @param {number} n - The number to check.
 * @returns {boolean} True if n is a power of 10, false otherwise.
 */
export function isPowerOfTen(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const p = Math.round(Math.log10(n));
  return Math.pow(10, p) === n;
}
