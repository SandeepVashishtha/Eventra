
/**
 * adds an nth index helper.
 */
export function indexOfNth(array, value, nth) {
  let seen = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) {
      seen += 1;
      if (seen === nth) return i;
    }
  }
  return -1;
}

