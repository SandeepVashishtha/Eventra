/**
 * Checks if a number is automorphic.
 * @param {number} n - The number.
 * @returns {boolean} True if automorphic, false otherwise.
 */
export function isAutomorphicNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const sq = n * n;
  return String(sq).endsWith(String(n));
}
