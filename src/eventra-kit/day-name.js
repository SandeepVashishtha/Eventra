
/**
 * adds a day name helper.
 */
export function dayName(date, locale = 'en-US') {
  return date.toLocaleString(locale, { weekday: 'long' });
}

