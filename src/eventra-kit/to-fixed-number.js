
/**
 * adds a fixed number helper.
 */
export function toFixedNumber(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}

