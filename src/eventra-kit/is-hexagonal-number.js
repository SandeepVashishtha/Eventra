/**
 * Checks if a number is a hexagonal number.
 * @param {number} x - The number to check.
 * @returns {boolean} True if x is a hexagonal number, false otherwise.
 */
export function isHexagonalNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  const val = Math.sqrt(8 * x + 1);
  return (val + 1) % 4 === 0;
}
