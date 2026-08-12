
/**
 * adds a weighted mean helper.
 */
export function weightedAverage(values, weights) {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (!totalWeight) return 0;
  const total = values.reduce((sum, v, i) => sum + v * weights[i], 0);
  return total / totalWeight;
}

