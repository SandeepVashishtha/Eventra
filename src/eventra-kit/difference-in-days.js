
/**
 * adds a days difference helper.
 */
export function differenceInDays(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

