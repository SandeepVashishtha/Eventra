/**
 * adds a average-index helper.
 */
export function averageIndex(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

