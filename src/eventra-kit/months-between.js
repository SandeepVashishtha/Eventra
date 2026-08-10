
/**
 * adds a month-span helper.
 */
export function monthsBetween(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth());
}

