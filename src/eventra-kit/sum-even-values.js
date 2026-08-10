
/**
 * adds an even-sum helper.
 */
export function sumEvenValues(array) {
  return array.filter((n) => n % 2 === 0).reduce((acc, n) => acc + n, 0);
}

export function sumOddValues(array) {
  return array.filter((n) => Math.abs(n) % 2 === 1).reduce((acc, n) => acc + n, 0);
}

