
/**
 * adds a geometric-mean helper.
 */
export function geometricMean(numbers) {
  if (!numbers.length) return 0;
  return Math.pow(numbers.reduce((p, n) => p * n, 1), 1 / numbers.length);
}

