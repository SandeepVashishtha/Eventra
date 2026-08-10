
/**
 * adds a squares helper.
 */
export function sumOfSquares(array) {
  return array.reduce((acc, n) => acc + n ** 2, 0);
}

