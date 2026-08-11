/**
 * Checks if a number is an Armstrong number.
 * @param {number} n - The number.
 * @returns {boolean} True if Armstrong, false otherwise.
 */
export function isArmstrongNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const digits = String(n).split("").map(Number);
  const p = digits.length;
  return digits.reduce((sum, d) => sum + Math.pow(d, p), 0) === n;
}
