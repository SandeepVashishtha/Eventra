
/**
 * adds a floor-to-step helper.
 */
export function roundDown(value, step = 1) {
  return Math.floor(value / step) * step;
}

