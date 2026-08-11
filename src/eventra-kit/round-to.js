
/**
 * adds precision rounding helpers.
 */
export function roundTo(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function ceilTo(value, precision = 0) {
  const factor = 10 ** precision;
  return Math.ceil(value * factor) / factor;
}

export function floorTo(value, precision = 0) {
  const factor = 10 ** precision;
  return Math.floor(value * factor) / factor;
}

