
/**
 * adds a currency symbol helper.
 */
export function currencySymbol(code) {
  const map = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', AUD: 'A$', CAD: 'C$', CHF: 'Fr' };
  return map[code] || code;
}

