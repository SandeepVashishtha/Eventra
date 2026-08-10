
/**
 * adds a digit-sum helper.
 */
export function sumDigits(value) {
  return String(Math.abs(value)).split('').reduce((acc, d) => acc + Number(d), 0);
}

