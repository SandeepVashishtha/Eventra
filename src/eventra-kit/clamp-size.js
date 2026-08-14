/**
 * adds a clamp-size helper.
 */
export function clampSize(value, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  const lower = typeof min === 'number' && Number.isFinite(min) ? min : 0;
  const upper = typeof max === 'number' && Number.isFinite(max) ? max : value;
  return Math.min(Math.max(value, lower), upper);
}

