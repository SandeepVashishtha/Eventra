
/**
 * adds an index finder helper.
 */
export function findAllIndexes(array, predicate) {
  const out = [];
  for (let i = 0; i < array.length; i++) if (predicate(array[i])) out.push(i);
  return out;
}

