/**
 * adds number formatting helpers.
 */
export function formatNumber(value, options = {}) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  const { locale = 'en-IN', maximumFractionDigits = 2 } = options;
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(num);
}

export function formatCompact(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}
