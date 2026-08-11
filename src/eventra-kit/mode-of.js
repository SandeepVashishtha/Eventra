
/**
 * adds a mode helper.
 */
export function modeOf(array) {
  const counts = countFrequency(array);
  let best = null;
  let bestCount = 0;
  for (const key in counts) {
    if (counts[key] > bestCount) {
      bestCount = counts[key];
      best = key;
    }
  }
  return Number.isNaN(Number(best)) ? best : Number(best);
}

