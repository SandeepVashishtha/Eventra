
/**
 * adds a days adder.
 */
export function addDaysToDate(date, days) {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

