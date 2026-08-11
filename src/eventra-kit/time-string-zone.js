
/**
 * adds a timezone offset helper.
 */
export function timeStringZone(date, locale = 'en-US') {
  return new Date(date).toLocaleTimeString(locale, { timeZoneName: 'short' });
}

