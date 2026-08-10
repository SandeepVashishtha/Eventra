
/**
 * adds business-day math.
 */
export function addBusinessDays(date, days) {
  const d = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) remaining--;
  }
  return d;
}

