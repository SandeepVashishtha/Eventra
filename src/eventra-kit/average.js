
/**
 * adds an arithmetic mean helper.
 */
export function average(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

