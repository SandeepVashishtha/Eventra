
/**
 * adds an array partitioner.
 */
export function partitionArray(array, predicate) {
  const yes = [];
  const no = [];
  for (const item of array) {
    if (predicate(item)) yes.push(item);
    else no.push(item);
  }
  return [yes, no];
}

