
/**
 * adds a night check.
 */
export function isNightTime(date) {
  const h = date.getHours();
  return h >= 21 || h < 5;
}

