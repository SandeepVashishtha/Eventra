
/**
 * adds a subarray finder.
 */
export function findSubarray(array, subarray) {
  outer: for (let i = 0; i <= array.length - subarray.length; i++) {
    for (let j = 0; j < subarray.length; j++) {
      if (array[i + j] !== subarray[j]) continue outer;
    }
    return i;
  }
  return -1;
}

