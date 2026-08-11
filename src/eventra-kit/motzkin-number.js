/**
 * Computes the nth Motzkin number.
 * @param {number} n - The index.
 * @returns {number} The Motzkin number.
 */
export function motzkinNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return 0;
  }
  const m = [1, 1];
  for (let i = 2; i <= n; i++) {
    let sum = m[i - 1];
    for (let j = 0; j <= i - 2; j++) {
      sum += m[j] * m[i - 2 - j];
    }
    m.push(sum);
  }
  return m[n];
}
