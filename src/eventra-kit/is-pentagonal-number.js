/**
 * Checks if a number is a pentagonal number.
 * @param {number} x - The number to check.
 * @returns {boolean} True if x is a pentagonal number, false otherwise.
 */
export function isPentagonalNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  const val = Math.sqrt(24 * x + 1);
  return (val + 1) % 6 === 0;
}
