
/**
 * adds a date clamp helper.
 */
export function clampDate(date, min, max) {
  const t = date.getTime();
  if (t < min.getTime()) return new Date(min);
  if (t > max.getTime()) return new Date(max);
  return new Date(date);
}

