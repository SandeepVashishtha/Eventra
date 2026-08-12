
/**
 * adds a bounded percent helper.
 */
export function boundedPercent(value) {
  return Math.min(100, Math.max(0, value));
}

