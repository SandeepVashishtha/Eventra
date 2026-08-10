
/**
 * adds a positional picker.
 */
export function nth(array, index) {
  return index < 0 ? array[array.length + index] : array[index];
}

