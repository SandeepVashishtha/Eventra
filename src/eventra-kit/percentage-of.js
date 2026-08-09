
/**
 * adds a percentage calculator.
 */
export function percentageOf(part, whole) {
  if (!whole) return 0;
  return (part / whole) * 100;
}

export function isPercentage(value) {
  return value >= 0 && value <= 100;
}

