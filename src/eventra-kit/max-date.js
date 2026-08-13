
/**
 * adds a max date helper.
 */
export function maxDate(a, b) {
  return a.getTime() >= b.getTime() ? a : b;
}

