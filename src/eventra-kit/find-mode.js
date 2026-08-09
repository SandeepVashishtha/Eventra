
/**
 * adds a mode helper.
 */
export function findMode(array) {
  const counts = new Map();
  for (const item of array) counts.set(item, (counts.get(item) || 0) + 1);
  let best;
  let bestCount = 0;
  for (const [item, count] of counts) {
    if (count > bestCount) {
      best = item;
      bestCount = count;
    }
  }
  return best;
}

