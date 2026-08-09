/**
 * adds a percent formatter.
 */
export function formatPercent(value, fractionDigits = 1) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0%';
  return `${(num * 100).toFixed(fractionDigits)}%`;
}
