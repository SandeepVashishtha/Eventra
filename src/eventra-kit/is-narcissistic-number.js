/**
 * Checks if a number is narcissistic (sum of digits raised to power of digit length equals number).
 * @param {number} n - The number to check.
 * @returns {boolean} True if narcissistic, false otherwise.
 */
export function isNarcissisticNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const digits = String(n).split("").map(Number);
  const power = digits.length;
  const sum = digits.reduce((acc, d) => acc + Math.pow(d, power), 0);
  return sum === n;
}
