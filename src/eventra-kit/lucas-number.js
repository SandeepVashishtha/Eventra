/**
 * Computes the nth Lucas number.
 * @param {number} n - The index.
 * @returns {number} The Lucas number.
 */
export function lucasNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  if (n === 0) return 2;
  if (n === 1) return 1;
  let a = 2,
    b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}
