/**
 * adds numeric clamp and lerp helpers.
 */
export function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function lerp(start, end, t) {
  return start + (end - start) * clamp(t, 0, 1);
}

export function inRange(value, min, max) {
  return value >= min && value <= max;
}
