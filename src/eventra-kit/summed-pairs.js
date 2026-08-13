
/**
 * adds a pair-sum helper.
 */
export function summedPairs(array, target) {
  const seen = new Map();
  const pairs = [];
  for (const value of array) {
    const needed = target - value;
    if (seen.has(needed)) pairs.push([needed, value]);
    seen.set(value, true);
  }
  return pairs;
}

