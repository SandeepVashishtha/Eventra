
/**
 * adds a morning check.
 */
export function isMorningTime(date) {
  const h = date.getHours();
  return h >= 5 && h < 12;
}

