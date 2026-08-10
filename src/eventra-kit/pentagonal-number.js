/**
 * Computes the nth pentagonal number.
 * @param {number} n - The index.
 * @returns {number} The nth pentagonal number, or 0 if invalid.
 */
export function pentagonalNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  return (3 * n * n - n) / 2;
}
