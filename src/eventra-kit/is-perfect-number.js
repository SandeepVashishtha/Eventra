/**
 * Checks if a number is perfect.
 * @param {number} n - The number.
 * @returns {boolean} True if perfect, false otherwise.
 */
export function isPerfectNumber(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  let sum = 0;
  for (let i = 1; i <= n / 2; i++) {
    if (n % i === 0) sum += i;
  }
  return sum === n;
}
