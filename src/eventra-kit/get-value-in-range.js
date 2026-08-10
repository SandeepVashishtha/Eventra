
/**
 * adds a clamped value helper.
 */
export function getValueInRange(value, min, max) {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.min(max, Math.max(min, num));
}

export function normalizeToRange(value, min, max, newMin = 0, newMax = 1) {
  if (max === min) return newMin;
  const t = (value - min) / (max - min);
  return newMin + t * (newMax - newMin);
}

