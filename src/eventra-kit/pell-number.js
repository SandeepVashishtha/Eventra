/**
 * Computes the nth Pell number.
 * @param {number} n - The index.
 * @returns {number} The Pell number.
 */
export function pellNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  if (n === 0) return 0;
  if (n === 1) return 1;
  let a = 0,
    b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = 2 * b + a;
    a = b;
    b = temp;
  }
  return b;
}
