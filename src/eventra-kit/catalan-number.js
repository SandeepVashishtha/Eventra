/**
 * Computes the nth Catalan number.
 * @param {number} n - The index.
 * @returns {number} The Catalan number.
 */
export function catalanNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  let res = 1;
  for (let i = 1; i <= n; i++) {
    res = (res * (4 * i - 2)) / (i + 1);
  }
  return Math.round(res);
}
