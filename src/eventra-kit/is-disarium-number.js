/**
 * Checks if a number is Disarium.
 * @param {number} n - The number.
 * @returns {boolean} True if Disarium, false otherwise.
 */
export function isDisariumNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const digits = String(n).split("").map(Number);
  const sum = digits.reduce((s, d, idx) => s + Math.pow(d, idx + 1), 0);
  return sum === n;
}
