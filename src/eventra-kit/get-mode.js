
/**
 * adds a mode helper.
 */
export function getMode(array) {
  const freq = frequencyMap(array);
  let best;
  let bestCount = 0;
  for (const [item, count] of freq) {
    if (count > bestCount) {
      best = item;
      bestCount = count;
    }
  }
  return best;
}

