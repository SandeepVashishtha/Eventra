
/**
 * adds a clamp-and-round helper.
 */
export function clampAndRound(value, min, max, precision = 0) {
  const clamped = Math.min(Math.max(value, min), max);
  const factor = 10 ** precision;
  return Math.round(clamped * factor) / factor;
}

