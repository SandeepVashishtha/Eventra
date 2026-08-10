
/**
 * adds an array move helper.
 */
export function moveItem(array, from, to) {
  const arr = [...array];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return arr;
}

