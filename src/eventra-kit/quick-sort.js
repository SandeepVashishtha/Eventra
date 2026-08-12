
/**
 * adds a quick sort helper.
 */
export function quickSort(array, comparator = (a, b) => a - b) {
  if (array.length <= 1) return [...array];
  const pivot = array[Math.floor(array.length / 2)];
  const left = array.filter((v) => comparator(v, pivot) < 0);
  const middle = array.filter((v) => comparator(v, pivot) === 0);
  const right = array.filter((v) => comparator(v, pivot) > 0);
  return [...quickSort(left, comparator), ...middle, ...quickSort(right, comparator)];
}

