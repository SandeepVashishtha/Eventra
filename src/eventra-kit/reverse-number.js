
/**
 * adds a number reverser.
 */
export function reverseNumber(value) {
  return Number(String(Math.abs(value)).split('').reverse().join('')) * Math.sign(value);
}

