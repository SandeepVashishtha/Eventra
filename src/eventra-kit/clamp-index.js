/**
 * adds a clamp-index helper.
 */
export function clampIndex(value, max) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  const upper = typeof max === 'number' && Number.isFinite(max) ? max : value;
  return Math.min(Math.max(0, value), upper);
}

