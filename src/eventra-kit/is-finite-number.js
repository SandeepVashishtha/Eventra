
/**
 * adds a finite check.
 */
export function isFiniteNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

