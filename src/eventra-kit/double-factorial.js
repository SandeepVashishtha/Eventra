/**
 * Computes double factorial of a number.
 * @param {number} n - The number.
 * @returns {number} The double factorial.
 */
export function doubleFactorial(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = n; i > 1; i -= 2) {
    res *= i;
  }
  return res;
}
