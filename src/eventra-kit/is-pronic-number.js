/**
 * Checks if a number is pronic.
 * @param {number} n - The number.
 * @returns {boolean} True if pronic, false otherwise.
 */
export function isPronicNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const val = Math.floor(Math.sqrt(n));
  return val * (val + 1) === n;
}
