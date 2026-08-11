
/**
 * adds a ceil-to-step helper.
 */
export function roundUp(value, step = 1) {
  return Math.ceil(value / step) * step;
}

