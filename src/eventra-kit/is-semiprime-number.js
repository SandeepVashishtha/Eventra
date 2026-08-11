/**
 * Checks if a number is a semiprime number (product of exactly two prime numbers).
 * @param {number} n - The number to check.
 * @returns {boolean} True if semiprime, false otherwise.
 */
export function isSemiprimeNumber(n) {
  if (typeof n !== "number" || n <= 3 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  let count = 0;
  let temp = n;
  for (let i = 2; i * i <= temp; i++) {
    while (temp % i === 0) {
      temp /= i;
      count++;
    }
  }
  if (temp > 1) {
    count++;
  }
  return count === 2;
}
