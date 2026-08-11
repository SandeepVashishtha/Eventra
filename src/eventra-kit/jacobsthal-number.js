/**
 * Computes the nth Jacobsthal number.
 * @param {number} n - The index.
 * @returns {number} The Jacobsthal number.
 */
export function jacobsthalNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  if (n === 0) return 0;
  if (n === 1) return 1;
  let a = 0,
    b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = b + 2 * a;
    a = b;
    b = temp;
  }
  return b;
}
