
/**
 * adds a fixed-chunk helper.
 */
export function chunkInto(array, size) {
  const s = Math.max(1, Math.floor(size));
  const out = [];
  for (let i = 0; i < array.length; i += s) out.push(array.slice(i, i + s));
  return out;
}

