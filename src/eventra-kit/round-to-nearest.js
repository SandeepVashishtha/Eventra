
/**
 * adds a nearest-step helper.
 */
export function roundToNearest(value, step = 1) {
  return Math.round(value / step) * step;
}

