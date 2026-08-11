/**
 * Checks if a number is a Tribonacci number.
 * @param {number} x - The number.
 * @returns {boolean} True if Tribonacci, false otherwise.
 */
export function isTribonacciNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  if (x === 0 || x === 1) return true;
  let a = 0,
    b = 1,
    c = 1;
  while (c < x) {
    const temp = a + b + c;
    a = b;
    b = c;
    c = temp;
  }
  return c === x;
}
