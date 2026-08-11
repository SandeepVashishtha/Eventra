
/**
 * adds a frequency helper.
 */
export function frequencyMap(array) {
  const freq = new Map();
  for (const item of array) freq.set(item, (freq.get(item) || 0) + 1);
  return freq;
}

