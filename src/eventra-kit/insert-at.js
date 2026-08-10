
/**
 * adds an index insert helper.
 */
export function insertAt(array, index, ...items) {
  const arr = [...array];
  arr.splice(index, 0, ...items);
  return arr;
}

