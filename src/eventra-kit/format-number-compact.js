
/**
 * adds a compact number formatter.
 */
export function formatNumberCompact(value, locale = 'en-US') {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

