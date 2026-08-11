/**
 * Checks if a number is a heptagonal number.
 * @param {number} x - The number to check.
 * @returns {boolean} True if x is a heptagonal number, false otherwise.
 */
export function isHeptagonalNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  const val = Math.sqrt(40 * x + 9);
  return (val + 3) % 10 === 0;
}
