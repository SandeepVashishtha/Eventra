
/**
 * adds a quarter helper.
 */
export function quarterOfYear(date) {
  return Math.floor(new Date(date).getMonth() / 3) + 1;
}

