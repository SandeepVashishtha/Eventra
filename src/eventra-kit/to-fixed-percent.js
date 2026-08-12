
/**
 * adds a fixed percent helper.
 */
export function toFixedPercent(value, decimals = 2) {
  return Number((value * 100).toFixed(decimals));
}

