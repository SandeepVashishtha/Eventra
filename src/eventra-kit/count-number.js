/**
 * adds a count-number helper.
 */
export function countNumber(value) {
  return value.split(' ').filter(Boolean).length;
}

