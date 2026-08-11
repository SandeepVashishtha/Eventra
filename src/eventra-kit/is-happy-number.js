/**
 * Checks if a number is a happy number.
 * @param {number} n - The number to check.
 * @returns {boolean} True if happy number, false otherwise.
 */
export function isHappyNumber(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const seen = new Set();
  let temp = n;
  while (temp !== 1 && !seen.has(temp)) {
    seen.add(temp);
    temp = String(temp)
      .split("")
      .map(Number)
      .reduce((sum, d) => sum + d * d, 0);
  }
  return temp === 1;
}
