/**
 * adds a currency formatter.
 */
export function formatCurrency(value, currency = 'INR', locale = 'en-IN') {
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(num);
}
