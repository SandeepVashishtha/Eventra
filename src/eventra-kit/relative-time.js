/**
 * adds a human-readable relative time formatter.
 */
export function relativeTime(input, now = Date.now()) {
  const date = input instanceof Date ? input.getTime() : new Date(input).getTime();
  if (Number.isNaN(date)) return '';
  const diff = Math.round((date - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diff) < 60) return rtf.format(diff, 'second');
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (Math.abs(diff) < 604800) return rtf.format(Math.round(diff / 86400), 'day');
  return rtf.format(Math.round(diff / 2592000), 'month');
}
