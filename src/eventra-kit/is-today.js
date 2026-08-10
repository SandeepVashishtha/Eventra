/**
 * adds date comparison helpers.
 */
export function isToday(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  return d.getFullYear() === today.getFullYear()
    && d.getMonth() === today.getMonth()
    && d.getDate() === today.getDate();
}
