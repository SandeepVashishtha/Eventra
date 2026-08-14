/**
 * adds a clamp-interval helper.
 */
export function clampInterval(value, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  const lower = typeof min === 'number' && Number.isFinite(min) ? min : value;
  const upper = typeof max === 'number' && Number.isFinite(max) ? max : value;
  return Math.min(Math.max(value, lower), upper);
}

