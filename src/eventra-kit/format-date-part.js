
/**
 * adds a date-part formatter.
 */
export function formatDatePart(date, locale = 'en-US') {
  const d = new Date(date);
  return {
    day: d.toLocaleDateString(locale, { day: '2-digit' }),
    month: d.toLocaleDateString(locale, { month: 'short' }),
    year: d.toLocaleDateString(locale, { year: 'numeric' }),
  };
}

