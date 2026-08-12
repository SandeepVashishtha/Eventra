
/**
 * adds a grouped number formatter.
 */
export function formatReadableNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}

