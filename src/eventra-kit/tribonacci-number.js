/**
 * Computes the nth Tribonacci number.
 * @param {number} n - The index.
 * @returns {number} The Tribonacci number.
 */
export function tribonacciNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  if (n === 0) return 0;
  if (n === 1 || n === 2) return 1;
  let a = 0,
    b = 1,
    c = 1;
  for (let i = 3; i <= n; i++) {
    const temp = a + b + c;
    a = b;
    b = c;
    c = temp;
  }
  return c;
}
