
/**
 * adds a ranking helper.
 */
export function getRanks(values) {
  const indexed = values.map((value, i) => ({ value, i }));
  const sorted = [...indexed].sort((a, b) => b.value - a.value);
  const rankMap = new Map();
  sorted.forEach((entry, rank) => rankMap.set(entry.i, rank + 1));
  return values.map((_, i) => rankMap.get(i));
}

