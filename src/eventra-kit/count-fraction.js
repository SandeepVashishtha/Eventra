/**
 * adds a count-fraction helper.
 */
export function countFraction(value) {
  return value.filter((item, index) => index % 2 === 1);
}

