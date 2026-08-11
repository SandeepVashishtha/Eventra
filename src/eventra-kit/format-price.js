
/**
 * adds a price formatter.
 */
export function formatPrice(value, currency = 'USD', locale = 'en-US') {
  return Number(value).toLocaleString(locale, { style: 'currency', currency });
}

