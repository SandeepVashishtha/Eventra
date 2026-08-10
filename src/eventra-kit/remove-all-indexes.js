
/**
 * adds a bulk index remover.
 */
export function removeAllIndexes(array, indexes) {
  const set = new Set(indexes);
  return array.filter((_, i) => !set.has(i));
}

