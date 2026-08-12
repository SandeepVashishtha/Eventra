
/**
 * adds a sorted insert helper.
 */
export function binaryInsert(sortedArray, value, getKey = (x) => x) {
  let low = 0;
  let high = sortedArray.length;
  const v = getKey(value);
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (getKey(sortedArray[mid]) < v) low = mid + 1;
    else high = mid;
  }
  sortedArray.splice(low, 0, value);
  return sortedArray;
}

