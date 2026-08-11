
/**
 * adds a min-max helper.
 */
export function getMinMax(array) {
  if (!array.length) return { min: undefined, max: undefined };
  return { min: Math.min(...array), max: Math.max(...array) };
}

