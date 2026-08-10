
/**
 * adds a frequency sorter.
 */
export function sortByCount(array, descending = true) {
  const freq = frequencyMap(array);
  return [...new Set(array)].sort((a, b) => (descending ? freq.get(b) - freq.get(a) : freq.get(a) - freq.get(b)));
}

