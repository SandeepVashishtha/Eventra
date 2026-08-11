
/**
 * adds a list bounds helper.
 */
export function listMinMax(array, key) {
  if (!array.length) return { min: undefined, max: undefined };
  const values = array.map((item) => (key ? item[key] : item));
  return { min: Math.min(...values), max: Math.max(...values) };
}

