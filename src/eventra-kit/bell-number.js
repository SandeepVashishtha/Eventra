/**
 * Computes the nth Bell number.
 * @param {number} n - The index.
 * @returns {number} The Bell number.
 */
export function bellNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  const bell = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  bell[0][0] = 1;
  for (let i = 1; i <= n; i++) {
    bell[i][0] = bell[i - 1][i - 1];
    for (let j = 1; j <= i; j++) {
      bell[i][j] = bell[i - 1][j - 1] + bell[i][j - 1];
    }
  }
  return bell[n][0];
}
