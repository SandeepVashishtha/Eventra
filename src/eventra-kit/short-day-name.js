
/**
 * adds a short day helper.
 */
export function shortDayName(date, locale = 'en-US') {
  return date.toLocaleString(locale, { weekday: 'short' });
}

