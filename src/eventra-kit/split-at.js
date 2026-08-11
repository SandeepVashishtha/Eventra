
/**
 * adds an index splitter.
 */
export function splitAt(array, index) {
  return [array.slice(0, index), array.slice(index)];
}

