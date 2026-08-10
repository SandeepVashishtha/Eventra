
/**
 * adds a unique concat helper.
 */
export function concatUnique(...arrays) {
  const seen = new Set();
  const out = [];
  for (const array of arrays) {
    for (const item of array) {
      if (!seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    }
  }
  return out;
}

