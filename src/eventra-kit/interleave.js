
/**
 * adds an interleave helper.
 */
export function interleave(...arrays) {
  const length = Math.max(...arrays.map((a) => a.length));
  const out = [];
  for (let i = 0; i < length; i++) {
    for (const array of arrays) {
      if (i < array.length) out.push(array[i]);
    }
  }
  return out;
}

