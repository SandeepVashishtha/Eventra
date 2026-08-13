
/**
 * adds a year-span helper.
 */
export function yearsBetween(a, b) {
  return Math.abs(new Date(b).getFullYear() - new Date(a).getFullYear());
}

