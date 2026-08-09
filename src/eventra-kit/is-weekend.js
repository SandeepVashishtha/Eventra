/**
 * adds date type helpers.
 */
export function isWeekend(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isWeekday(date) {
  return !isWeekend(date);
}
