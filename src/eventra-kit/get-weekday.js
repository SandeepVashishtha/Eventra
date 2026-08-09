
/**
 * adds a weekday extractor.
 */
export function getWeekday(date, locale = 'en-US') {
  return new Date(date).toLocaleDateString(locale, { weekday: 'long' });
}

