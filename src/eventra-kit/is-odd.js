
/**
 * adds a parity check.
 */
export function isOdd(value) {
  return Math.abs(value) % 2 === 1;
}

export function isEven(value) {
  return Math.abs(value) % 2 === 0;
}

