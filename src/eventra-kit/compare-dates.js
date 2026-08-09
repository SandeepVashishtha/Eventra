
/**
 * adds a date comparison helper.
 */
export function compareDates(a, b) {
  return new Date(a).getTime() - new Date(b).getTime();
}

