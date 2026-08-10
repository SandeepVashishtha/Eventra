
/**
 * adds a grouped number formatter.
 */
export function formatIntegerGroup(value, locale = 'en-US') {
  return Number(value).toLocaleString(locale);
}

