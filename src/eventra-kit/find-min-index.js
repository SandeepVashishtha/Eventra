
/**
 * adds a min index helper.
 */
export function findMinIndex(array) {
  let index = -1;
  let min = Infinity;
  for (let i = 0; i < array.length; i++) {
    if (array[i] < min) {
      min = array[i];
      index = i;
    }
  }
  return index;
}

