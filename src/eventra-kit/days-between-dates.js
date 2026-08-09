
/**
 * adds a day-span helper.
 */
export function daysBetweenDates(a, b) {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.floor(ms / 86400000);
}

