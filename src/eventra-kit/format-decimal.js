
/**
 * adds a decimal formatter.
 */
export function formatDecimal(value, places = 2) {
  return Number(value).toFixed(places);
}

