
/**
 * adds a partition helper.
 */
export function partition(array, predicate) {
  const yes = [];
  const no = [];
  for (const item of array) (predicate(item) ? yes : no).push(item);
  return [yes, no];
}

