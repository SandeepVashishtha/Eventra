
/**
 * adds a down rounding helper.
 */
export function roundDownTo(value, precision = 0) {
  const factor = 10 ** precision;
  return Math.floor(value * factor) / factor;
}

