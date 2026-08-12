
/**
 * adds a percent normalizer.
 */
export function normalizePercent(value) {
  if (value > 1) return value / 100;
  return value;
}

