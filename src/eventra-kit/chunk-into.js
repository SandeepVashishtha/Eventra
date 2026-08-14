
/**
 * adds a fixed-chunk helper.
 */
export function chunkInto(array, size) {
  if (size <= 0) return [array];
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

