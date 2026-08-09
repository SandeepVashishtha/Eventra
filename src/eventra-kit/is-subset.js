
/**
 * adds a subset check.
 */
export function isSubset(subset, superset) {
  const set = new Set(superset);
  return subset.every((value) => set.has(value));
}

