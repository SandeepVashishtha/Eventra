
/**
 * adds a percent string helper.
 */
export function toPercentString(value, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`;
}

