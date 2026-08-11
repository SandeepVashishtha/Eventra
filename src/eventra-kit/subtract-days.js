
/**
 * adds a day subtraction helper.
 */
export function subtractDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

