
/**
 * adds an adaptive-fixed helper.
 */
export function toFixedSmart(value, maxPlaces = 2) {
  const fixed = Number(value).toFixed(maxPlaces);
  return parseFloat(fixed).toString();
}

