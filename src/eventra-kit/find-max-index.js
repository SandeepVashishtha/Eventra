
/**
 * adds a max index helper.
 */
export function findMaxIndex(array) {
  let index = -1;
  let max = -Infinity;
  for (let i = 0; i < array.length; i++) {
    if (array[i] > max) {
      max = array[i];
      index = i;
    }
  }
  return index;
}

