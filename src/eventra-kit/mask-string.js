/**
 * adds a data masking helper.
 */
export function maskString(value, start = 0, end = 0, maskChar = '*') {
  if (typeof value !== 'string') return '';
  if (value.length <= start + end) return value;
  const mask = maskChar.repeat(Math.max(1, value.length - start - end));
  return value.slice(0, start) + mask + value.slice(-end || value.length);
}
