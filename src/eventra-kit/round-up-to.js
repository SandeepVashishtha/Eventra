
/**
 * adds an up rounding helper.
 */
export function roundUpTo(value, precision = 0) {
  const factor = 10 ** precision;
  return Math.ceil(value * factor) / factor;
}

