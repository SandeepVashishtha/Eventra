/**
 * Checks if a number is a Harshad number.
 * @param {number} n - The number to check.
 * @returns {boolean} True if Harshad number, false otherwise.
 */
export function isHarshadNumber(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const sum = String(n)
    .split("")
    .map(Number)
    .reduce((s, d) => s + d, 0);
  return n % sum === 0;
}
