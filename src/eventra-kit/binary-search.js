
/**
 * adds a binary search helper.
 */
export function binarySearch(sortedArray, target, comparator = (a, b) => a - b) {
  let lo = 0;
  let hi = sortedArray.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cmp = comparator(sortedArray[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

