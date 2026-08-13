
/**
 * adds a percent normalizer.
 */
export function normalizePercent(value) {
  if (Math.abs(value) > 1) return value / 100;
  return value;
}

