/**
 * Checks if a number is an octagonal number.
 * @param {number} x - The number to check.
 * @returns {boolean} True if x is an octagonal number, false otherwise.
 */
export function isOctagonalNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  const val = Math.sqrt(3 * x + 1);
  return (val + 1) % 3 === 0;
}
