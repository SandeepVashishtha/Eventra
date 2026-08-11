/**
 * Checks if a number is composite (has factors other than 1 and itself).
 * @param {number} n - The number to check.
 * @returns {boolean} True if composite, false otherwise.
 */
export function isCompositeNumber(n) {
  if (typeof n !== "number" || n <= 3 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      return true;
    }
  }
  return false;
}
