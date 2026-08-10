
/**
 * adds a frequency counter.
 */
export function countFrequency(array) {
  const counts = {};
  for (const item of array) counts[item] = (counts[item] || 0) + 1;
  return counts;
}

