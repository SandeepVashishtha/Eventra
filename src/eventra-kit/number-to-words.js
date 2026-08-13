
/**
 * adds a number words helper.
 */
export function numberToWords(value) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  if (value < 20) return ones[value] || String(value);
  if (value < 100) {
    const t = Math.floor(value / 10);
    const o = value % 10;
    return `${tens[t]}${o ? `-${ones[o]}` : ''}`;
  }
  if (value < 1000) {
    const h = Math.floor(value / 100);
    const rest = value % 100;
    return `${ones[h]} hundred${rest ? ` ${numberToWords(rest)}` : ''}`;
  }
  return String(value);
}

