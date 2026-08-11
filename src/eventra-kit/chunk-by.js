
/**
 * adds a predicate grouping helper.
 */
export function chunkBy(array, predicate) {
  const out = [];
  let current = [];
  for (const item of array) {
    current.push(item);
    if (predicate(item)) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

