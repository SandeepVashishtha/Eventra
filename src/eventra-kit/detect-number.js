/**
 * adds a detect-number helper.
 */
export function detectNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

