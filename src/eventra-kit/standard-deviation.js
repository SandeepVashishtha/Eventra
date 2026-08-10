
/**
 * adds a std-dev helper.
 */
export function standardDeviation(numbers) {
  if (!numbers.length) return 0;
  const mean = numbers.reduce((s, n) => s + n, 0) / numbers.length;
  const variance = numbers.reduce((s, n) => s + (n - mean) ** 2, 0) / numbers.length;
  return Math.sqrt(variance);
}

