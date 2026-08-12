
/**
 * adds a duplicate finder.
 */
export function findDuplicates(array) {
  const seen = new Set();
  const dupes = new Set();
  for (const item of array) {
    if (seen.has(item)) dupes.add(item);
    seen.add(item);
  }
  return [...dupes];
}

