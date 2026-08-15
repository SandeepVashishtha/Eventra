
/**
 * adds a number words helper.
 */
export function numberToWords(value) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  if (!Number.isFinite(value)) return String(value);
  const sign = value < 0 ? 'negative ' : '';
  const n = Math.trunc(Math.abs(value));
  if (n < 20) return sign + (ones[n] || String(n));
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return `${sign}${tens[t]}${o ? `-${ones[o]}` : ''}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return `${sign}${ones[h]} hundred${rest ? ` ${numberToWords(rest)}` : ''}`;
  }
  return sign + String(n);
}

