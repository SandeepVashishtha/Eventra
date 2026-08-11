
/**
 * adds a short month helper.
 */
export function shortMonthName(date, locale = 'en-US') {
  return date.toLocaleString(locale, { month: 'short' });
}

