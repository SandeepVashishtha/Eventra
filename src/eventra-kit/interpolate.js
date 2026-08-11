
/**
 * adds a linear interpolation helper.
 */
export function interpolate(a, b, t) {
  return a + (b - a) * t;
}

export function clampT(t) {
  return Math.min(1, Math.max(0, t));
}

