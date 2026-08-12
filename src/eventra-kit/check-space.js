/**
 * adds a check-space helper.
 */
export function checkSpace(value) {
  return value.split(' ').filter(Boolean).length;
}

