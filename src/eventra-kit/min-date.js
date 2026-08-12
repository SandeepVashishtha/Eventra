
/**
 * adds a min date helper.
 */
export function minDate(a, b) {
  return a.getTime() <= b.getTime() ? a : b;
}

