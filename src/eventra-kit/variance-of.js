
/**
 * adds a variance helper.
 */
export function varianceOf(numbers) {
  if (!numbers.length) return 0;
  const mean = numbers.reduce((s, n) => s + n, 0) / numbers.length;
  return numbers.reduce((s, n) => s + (n - mean) ** 2, 0) / numbers.length;
}

