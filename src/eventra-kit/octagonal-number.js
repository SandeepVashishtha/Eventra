/**
 * Computes the nth octagonal number.
 * @param {number} n - The index.
 * @returns {number} The nth octagonal number, or 0 if invalid.
 */
export function octagonalNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  return 3 * n * n - 2 * n;
}
