
/**
 * adds a sum-pair helper.
 */
export function arraySumPair(array, target) {
  const map = new Map();
  for (let i = 0; i < array.length; i++) {
    const needed = target - array[i];
    if (map.has(needed)) return [map.get(needed), i];
    map.set(array[i], i);
  }
  return null;
}

