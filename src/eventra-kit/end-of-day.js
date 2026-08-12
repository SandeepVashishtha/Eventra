
/**
 * adds a day end helper.
 */
export function endOfDay(date) {
  const out = new Date(date);
  out.setHours(23, 59, 59, 999);
  return out;
}

