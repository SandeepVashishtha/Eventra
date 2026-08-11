/**
 * adds a date difference helper.
 */
export function daysBetween(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return 0;
  const ms = Math.abs(da.getTime() - db.getTime());
  return Math.floor(ms / 86400000);
}
