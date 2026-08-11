
/**
 * adds a month name helper.
 */
export function monthName(date, locale = 'en-US') {
  return date.toLocaleString(locale, { month: 'long' });
}

