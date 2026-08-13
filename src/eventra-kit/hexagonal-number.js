/**
 * Computes the nth hexagonal number.
 * @param {number} n - The index.
 * @returns {number} The nth hexagonal number, or 0 if invalid.
 */
export function hexagonalNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  return 2 * n * n - n;
}
