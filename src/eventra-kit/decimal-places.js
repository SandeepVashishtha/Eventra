
/**
 * adds a decimal-place counter.
 */
export function decimalPlaces(value) {
  const str = String(value);
  const parts = str.split('.');
  return parts.length === 2 ? parts[1].length : 0;
}

