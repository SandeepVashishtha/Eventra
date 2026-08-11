/**
 * Computes the nth row of Pascal's Triangle.
 * @param {number} n - The row index.
 * @returns {number[]} The row.
 */
export function pascalTriangleRow(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return [];
  }
  const row = [1];
  for (let i = 1; i <= n; i++) {
    row.push((row[i - 1] * (n - i + 1)) / i);
  }
  return row;
}
