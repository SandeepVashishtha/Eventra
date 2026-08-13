/**
 * adds a count-file helper.
 */
export function countFile(value) {
  return value.filter((item, index) => index % 2 === 0);
}

