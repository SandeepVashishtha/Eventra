
/**
 * adds an hours difference helper.
 */
export function differenceInHours(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 3600000);
}

