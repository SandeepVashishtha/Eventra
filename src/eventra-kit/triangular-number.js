/**
 * Computes the nth triangular number.
 * @param {number} n - The index.
 * @returns {number} The nth triangular number, or 0 if invalid.
 */
export function triangularNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  return (n * (n + 1)) / 2;
}
