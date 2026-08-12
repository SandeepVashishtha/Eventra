
/**
 * adds an evening check.
 */
export function isEveningTime(date) {
  const h = date.getHours();
  return h >= 17 && h < 21;
}

