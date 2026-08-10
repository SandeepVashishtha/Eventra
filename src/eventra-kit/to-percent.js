
/**
 * adds a percent formatter.
 */
export function toPercent(value, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`;
}

