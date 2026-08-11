
/**
 * adds a long date formatter.
 */
export function formatDateLong(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(d);
}

