
/**
 * adds a money formatting alias.
 */
export function toMoney(value, currency = 'USD', locale = 'en-US') {
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num);
}

