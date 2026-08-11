/**
 * Generates the Collatz sequence.
 * @param {number} n - The starting number.
 * @returns {number[]} The Collatz sequence.
 */
export function collatzSequence(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return [];
  }
  const seq = [n];
  let temp = n;
  while (temp > 1) {
    if (temp % 2 === 0) temp /= 2;
    else temp = 3 * temp + 1;
    seq.push(temp);
  }
  return seq;
}
