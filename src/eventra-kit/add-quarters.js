
/**
 * adds quarter-based date math.
 */
export function addQuarters(date, quarters) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + quarters * 3);
  return d;
}

