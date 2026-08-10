
/**
 * adds a safe number parser.
 */
export function toNumber(value, fallback = 0) {
  if (typeof value === 'number') return Number.isNaN(value) ? fallback : value;
  const n = Number.parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
  return Number.isNaN(n) ? fallback : n;
}

export function parseIntSafe(value, radix = 10, fallback = 0) {
  const n = Number.parseInt(value, radix);
  return Number.isNaN(n) ? fallback : n;
}

