
/**
 * adds a year-start helper.
 */
export function startOfYear(date) {
  return new Date(new Date(date).getFullYear(), 0, 1);
}

export function endOfYear(date) {
  return new Date(new Date(date).getFullYear(), 11, 31, 23, 59, 59, 999);
}

