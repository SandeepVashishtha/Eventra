/**
 * Checks if a number is a Smith number.
 * @param {number} n - The number to check.
 * @returns {boolean} True if Smith number, false otherwise.
 */
export function isSmithNumber(n) {
  if (typeof n !== "number" || n <= 1 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const isPrime = (num) => {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };
  if (isPrime(n)) return false;
  const sumDigits = (num) =>
    String(num)
      .split("")
      .map(Number)
      .reduce((s, d) => s + d, 0);
  const nDigitSum = sumDigits(n);
  let temp = n;
  let factorDigitSum = 0;
  for (let i = 2; i <= temp; i++) {
    while (temp % i === 0) {
      factorDigitSum += sumDigits(i);
      temp /= i;
    }
  }
  return nDigitSum === factorDigitSum;
}
